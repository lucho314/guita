import { BudgetWithSpending } from '@/types/database';

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
