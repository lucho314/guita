import { useEffect } from 'react';
import { useTransactionStore } from '@/store/transaction-store';
import { useAuth } from './use-auth';
import { Transaction } from '@/types/database';
import dayjs from 'dayjs';

export function useTransactions(month?: string) {
  const { user } = useAuth();
  const {
    transactions,
    monthlyTotals,
    weeklySpending,
    isLoading,
    fetchMonthly,
    fetchWeekly,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactionStore();

  useEffect(() => {
    if (user?.id) {
      fetchMonthly(user.id, month);
      fetchWeekly(user.id);
    }
  }, [user?.id, month]);

  // Group transactions by date for SectionList
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = dayjs(t.transaction_date).format('YYYY-MM-DD');
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const sections = Object.entries(grouped)
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([date, data]) => ({ title: date, data }));

  const recentTransactions = transactions.slice(0, 5);

  return {
    transactions,
    sections,
    recentTransactions,
    monthlyTotals,
    weeklySpending,
    isLoading,
    addTransaction: (payload: Parameters<typeof addTransaction>[1]) =>
      user ? addTransaction(user.id, payload) : Promise.reject('Not authenticated'),
    editTransaction,
    removeTransaction,
    refresh: () => user && fetchMonthly(user.id, month),
  };
}
