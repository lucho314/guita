import dayjs from 'dayjs';
import { BudgetWithSpending, EmergencyFundAnalysis, SpendingLeak, LeakSeverity } from '@/types/database';
import { supabase } from './supabase';

export interface OverspendingAlert {
  categoryLabel: string;
  spent: number;
  limit: number;
  percentage: number;
}

export interface AdjustmentSuggestion {
  message: string;
  amount: number;
}

export function detectOverspending(budget: BudgetWithSpending): OverspendingAlert[] {
  const alerts: OverspendingAlert[] = [];

  for (const bc of budget.budget_categories ?? []) {
    if (!bc.amount_limit || !bc.spent) continue;
    const pct = bc.spent / bc.amount_limit;
    if (pct >= 0.8) {
      alerts.push({
        categoryLabel: bc.category?.label ?? 'Categoría',
        spent: bc.spent,
        limit: bc.amount_limit,
        percentage: pct,
      });
    }
  }

  return alerts.sort((a, b) => b.percentage - a.percentage);
}

export function suggestAdjustments(budget: BudgetWithSpending): AdjustmentSuggestion[] {
  const suggestions: AdjustmentSuggestion[] = [];
  const remaining = budget.total_limit - budget.total_spent;

  if (remaining < 0) {
    suggestions.push({
      message: `Has excedido tu presupuesto por ${Math.abs(remaining).toFixed(2)}. Considera reducir gastos en entretenimiento o suscripciones.`,
      amount: Math.abs(remaining),
    });
  } else if (remaining < budget.total_limit * 0.2) {
    suggestions.push({
      message: `Te quedan solo $${remaining.toFixed(2)} del presupuesto mensual. Ten cuidado con tus gastos esta semana.`,
      amount: remaining,
    });
  }

  return suggestions;
}

export function getBudgetStatus(percentage: number): 'ok' | 'warning' | 'exceeded' {
  if (percentage >= 1) return 'exceeded';
  if (percentage >= 0.8) return 'warning';
  return 'ok';
}

export function getBudgetStatusLabel(status: 'ok' | 'warning' | 'exceeded'): string {
  switch (status) {
    case 'exceeded': return 'Excedido';
    case 'warning': return 'Cerca del límite';
    case 'ok': return 'En orden';
  }
}

export function getBudgetStatusColor(status: 'ok' | 'warning' | 'exceeded'): string {
  switch (status) {
    case 'exceeded': return '#EF4444';
    case 'warning': return '#F59E0B';
    case 'ok': return '#22C55E';
  }
}

export async function getEmergencyFundAnalysis(userId: string): Promise<EmergencyFundAnalysis> {
  const twelveMonthsAgo = dayjs().subtract(12, 'month').startOf('month').toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, transaction_date')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', twelveMonthsAgo);

  if (error) throw error;

  const currentMonth = dayjs().format('YYYY-MM');
  const byMonth: Record<string, number> = {};

  for (const t of data ?? []) {
    const month = dayjs(t.transaction_date).format('YYYY-MM');
    if (month === currentMonth) continue; // exclude incomplete current month
    byMonth[month] = (byMonth[month] ?? 0) + t.amount;
  }

  const monthlyAmounts = Object.values(byMonth);
  const monthsOfData = monthlyAmounts.length;
  const hasEnoughData = monthsOfData >= 3;
  const averageMonthlyExpenses =
    monthsOfData > 0 ? monthlyAmounts.reduce((s, a) => s + a, 0) / monthsOfData : 0;

  return {
    monthsOfData,
    averageMonthlyExpenses,
    minimum: averageMonthlyExpenses * 3,
    recommended: averageMonthlyExpenses * 6,
    maximum: averageMonthlyExpenses * 12,
    hasEnoughData,
    monthsNeeded: Math.max(0, 3 - monthsOfData),
  };
}

function leakSeverityByAmount(amount: number, avgMonthly: number): LeakSeverity {
  const ratio = avgMonthly > 0 ? amount / avgMonthly : 0;
  if (ratio >= 0.3) return 'high';
  if (ratio >= 0.15) return 'medium';
  return 'low';
}

export async function getSpendingLeaks(userId: string): Promise<SpendingLeak[]> {
  const sixMonthsAgo = dayjs().subtract(6, 'month').startOf('month').toISOString();

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, transaction_date, category_id, category:categories(id, label, icon, color)')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', sixMonthsAgo);

  if (error) throw error;

  const transactions = (data ?? []) as Array<{
    amount: number;
    transaction_date: string;
    category_id: string;
    category: { id: string; label: string; icon: string; color: string } | null;
  }>;

  const currentMonth = dayjs().format('YYYY-MM');
  const leaks: SpendingLeak[] = [];

  // --- Totales para severity relativa ---
  const allMonths = [...new Set(
    transactions
      .map(t => dayjs(t.transaction_date).format('YYYY-MM'))
      .filter(m => m !== currentMonth)
  )];
  const numHistMonths = allMonths.length;
  const historical = transactions.filter(t => dayjs(t.transaction_date).format('YYYY-MM') !== currentMonth);
  const current = transactions.filter(t => dayjs(t.transaction_date).format('YYYY-MM') === currentMonth);
  const avgMonthlyTotal = numHistMonths > 0
    ? historical.reduce((s, t) => s + t.amount, 0) / numHistMonths
    : 0;

  // --- 1. GASTOS RECURRENTES ---
  // Categoría que aparece en >= 4 de los últimos 6 meses completados
  const catMonths: Record<string, Set<string>> = {};
  const catHistAmounts: Record<string, number> = {};
  const catMeta: Record<string, { label: string; icon: string; color: string }> = {};

  for (const t of historical) {
    const month = dayjs(t.transaction_date).format('YYYY-MM');
    if (!catMonths[t.category_id]) catMonths[t.category_id] = new Set();
    catMonths[t.category_id].add(month);
    catHistAmounts[t.category_id] = (catHistAmounts[t.category_id] ?? 0) + t.amount;
    if (t.category) catMeta[t.category_id] = t.category;
  }

  const threshold = Math.max(4, Math.ceil(numHistMonths * 0.66));

  for (const [catId, months] of Object.entries(catMonths)) {
    if (months.size < threshold) continue;
    const avgMonthly = catHistAmounts[catId] / months.size;
    const meta = catMeta[catId];
    leaks.push({
      type: 'recurring',
      categoryId: catId,
      categoryLabel: meta?.label ?? 'Categoría',
      categoryIcon: meta?.icon ?? 'receipt',
      categoryColor: meta?.color ?? '#6B7280',
      monthlyAmount: avgMonthly,
      severity: leakSeverityByAmount(avgMonthly, avgMonthlyTotal),
      detail: `Presente en ${months.size} de los últimos ${numHistMonths} meses`,
    });
  }

  // --- 2. CATEGORÍAS DISPARADAS (spike) ---
  // Solo si hay al menos 3 meses históricos
  if (numHistMonths >= 3) {
    const catHistByMonth: Record<string, Record<string, number>> = {};
    for (const t of historical) {
      const month = dayjs(t.transaction_date).format('YYYY-MM');
      if (!catHistByMonth[t.category_id]) catHistByMonth[t.category_id] = {};
      catHistByMonth[t.category_id][month] = (catHistByMonth[t.category_id][month] ?? 0) + t.amount;
    }

    const catCurrentAmounts: Record<string, number> = {};
    for (const t of current) {
      catCurrentAmounts[t.category_id] = (catCurrentAmounts[t.category_id] ?? 0) + t.amount;
      if (t.category) catMeta[t.category_id] = t.category;
    }

    for (const [catId, currentAmount] of Object.entries(catCurrentAmounts)) {
      const histMonthAmounts = Object.values(catHistByMonth[catId] ?? {});
      if (histMonthAmounts.length < 2) continue;
      const histAvg = histMonthAmounts.reduce((s, a) => s + a, 0) / histMonthAmounts.length;
      const ratio = histAvg > 0 ? currentAmount / histAvg : 0;
      if (ratio < 1.5) continue;

      const meta = catMeta[catId];
      const severity: LeakSeverity = ratio >= 3 ? 'high' : ratio >= 2 ? 'medium' : 'low';
      leaks.push({
        type: 'spike',
        categoryId: catId,
        categoryLabel: meta?.label ?? 'Categoría',
        categoryIcon: meta?.icon ?? 'receipt',
        categoryColor: meta?.color ?? '#6B7280',
        monthlyAmount: currentAmount,
        severity,
        detail: `${Math.round(ratio * 100 - 100)}% más que tu promedio histórico`,
      });
    }
  }

  // --- 3. GASTOS FRECUENTES PEQUEÑOS ---
  // Categoría con >= 5 transacciones en el mes actual y avg por transacción bajo
  const catCurrentTx: Record<string, { count: number; total: number }> = {};
  for (const t of current) {
    if (!catCurrentTx[t.category_id]) catCurrentTx[t.category_id] = { count: 0, total: 0 };
    catCurrentTx[t.category_id].count++;
    catCurrentTx[t.category_id].total += t.amount;
    if (t.category) catMeta[t.category_id] = t.category;
  }

  for (const [catId, { count, total }] of Object.entries(catCurrentTx)) {
    if (count < 5) continue;
    const avgPerTx = total / count;
    // Solo si el promedio por transacción es menor al 10% del gasto mensual promedio
    // (indica muchos gastos pequeños vs pocos grandes)
    if (avgMonthlyTotal > 0 && avgPerTx > avgMonthlyTotal * 0.1) continue;
    const meta = catMeta[catId];
    leaks.push({
      type: 'small-frequent',
      categoryId: catId,
      categoryLabel: meta?.label ?? 'Categoría',
      categoryIcon: meta?.icon ?? 'receipt',
      categoryColor: meta?.color ?? '#6B7280',
      monthlyAmount: total,
      severity: leakSeverityByAmount(total, avgMonthlyTotal),
      detail: `${count} transacciones este mes · promedio por compra bajo`,
    });
  }

  return leaks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}
