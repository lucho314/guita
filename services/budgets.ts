import { supabase } from './supabase';
import { Budget, BudgetCategory, BudgetWithSpending } from '@/types/database';
import { getBudgetStatus } from './analytics';
import dayjs from 'dayjs';

export async function fetchBudgets(userId: string): Promise<Budget[]> {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, budget_categories(*, category:categories(*))')
    .eq('user_id', userId)
    .order('month', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Budget[];
}

export async function fetchCurrentBudget(
  userId: string,
  month?: string
): Promise<BudgetWithSpending | null> {
  const targetMonth = month ?? dayjs().format('YYYY-MM');

  const { data, error } = await supabase
    .from('budgets')
    .select('*, budget_categories(*, category:categories(*))')
    .eq('user_id', userId)
    .eq('month', targetMonth)
    .single();

  if (error || !data) return null;

  // Fetch spending per category this month
  const startOf = dayjs(targetMonth).startOf('month').toISOString();
  const endOf = dayjs(targetMonth).endOf('month').toISOString();

  const { data: txData } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('transaction_date', startOf)
    .lte('transaction_date', endOf);

  const spendingByCategory: Record<string, number> = {};
  for (const tx of txData ?? []) {
    spendingByCategory[tx.category_id] = (spendingByCategory[tx.category_id] ?? 0) + tx.amount;
  }

  const total_spent = Object.values(spendingByCategory).reduce((s, a) => s + a, 0);
  const percentage = data.total_limit > 0 ? total_spent / data.total_limit : 0;

  const budget = data as Budget;
  const budgetWithSpending: BudgetWithSpending = {
    ...budget,
    total_spent,
    percentage,
    status: getBudgetStatus(percentage),
    budget_categories: (budget.budget_categories ?? []).map((bc: BudgetCategory) => ({
      ...bc,
      spent: spendingByCategory[bc.category_id] ?? 0,
    })),
  };

  return budgetWithSpending;
}

export async function createBudget(
  userId: string,
  month: string,
  totalLimit: number,
  categoryLimits: { category_id: string; amount_limit: number }[]
): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .insert({ user_id: userId, month, total_limit: totalLimit })
    .select()
    .single();

  if (error) throw error;

  if (categoryLimits.length > 0) {
    await supabase.from('budget_categories').insert(
      categoryLimits.map((cl) => ({
        budget_id: data.id,
        category_id: cl.category_id,
        amount_limit: cl.amount_limit,
      }))
    );
  }

  return data as Budget;
}

export async function updateBudgetCategoryLimit(
  budgetCategoryId: string,
  amountLimit: number
): Promise<void> {
  const { error } = await supabase
    .from('budget_categories')
    .update({ amount_limit: amountLimit })
    .eq('id', budgetCategoryId);

  if (error) throw error;
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
}
