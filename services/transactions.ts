import dayjs from 'dayjs';
import { supabase } from './supabase';
import { Transaction, MonthlyTotals, WeeklySpending } from '@/types/database';

export async function fetchTransactions(userId: string, month?: string): Promise<Transaction[]> {
  const startOf = dayjs(month || undefined).startOf('month').format('YYYY-MM-DD');
  const endOf = dayjs(month || undefined).endOf('month').add(1, 'day').format('YYYY-MM-DD');

  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .gte('transaction_date', startOf)
    .lt('transaction_date', endOf)
    .order('transaction_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function fetchAllTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Transaction[];
}

export async function createTransaction(
  userId: string,
  payload: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...payload, user_id: userId })
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function updateTransaction(
  id: string,
  payload: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .select('*, category:categories(*)')
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function getMonthlyTotals(
  userId: string,
  month?: string
): Promise<MonthlyTotals> {
  const transactions = await fetchTransactions(userId, month);
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return { income, expenses, balance: income - expenses };
}

export async function getWeeklySpending(userId: string): Promise<WeeklySpending[]> {
  const days: WeeklySpending[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day');
    const start = date.format('YYYY-MM-DD');
    const end = date.add(1, 'day').format('YYYY-MM-DD');

    const { data } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('transaction_date', start)
      .lt('transaction_date', end);

    const amount = (data ?? []).reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
    days.push({ day: date.format('ddd'), amount });
  }

  return days;
}
