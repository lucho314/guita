import { create } from 'zustand';
import { Transaction, MonthlyTotals, WeeklySpending } from '@/types/database';
import {
  fetchTransactions,
  fetchAllTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyTotals,
  getWeeklySpending,
} from '@/services/transactions';

interface TransactionState {
  transactions: Transaction[];
  allTransactions: Transaction[];
  monthlyTotals: MonthlyTotals;
  weeklySpending: WeeklySpending[];
  isLoading: boolean;
  currentMonth: string | undefined;

  fetchMonthly: (userId: string, month?: string) => Promise<void>;
  fetchAll: (userId: string) => Promise<void>;
  fetchWeekly: (userId: string) => Promise<void>;
  addTransaction: (
    userId: string,
    payload: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>
  ) => Promise<Transaction>;
  editTransaction: (
    id: string,
    payload: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'category'>>
  ) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  allTransactions: [],
  monthlyTotals: { income: 0, expenses: 0, balance: 0 },
  weeklySpending: [],
  isLoading: false,
  currentMonth: undefined,

  fetchMonthly: async (userId, month) => {
    set({ isLoading: true, currentMonth: month });
    try {
      const [transactions, totals] = await Promise.all([
        fetchTransactions(userId, month),
        getMonthlyTotals(userId, month),
      ]);
      set({ transactions, monthlyTotals: totals, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchAll: async (userId) => {
    set({ isLoading: true });
    try {
      const allTransactions = await fetchAllTransactions(userId);
      set({ allTransactions, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchWeekly: async (userId) => {
    const weeklySpending = await getWeeklySpending(userId);
    set({ weeklySpending });
  },

  addTransaction: async (userId, payload) => {
    const tx = await createTransaction(userId, payload);
    const { transactions, allTransactions, monthlyTotals } = get();
    const updatedTransactions = [tx, ...transactions];
    const updatedAll = [tx, ...allTransactions];
    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    set({
      transactions: updatedTransactions,
      allTransactions: updatedAll,
      monthlyTotals: {
        income: monthlyTotals.income + (tx.type === 'income' ? tx.amount : 0),
        expenses: monthlyTotals.expenses + (tx.type === 'expense' ? tx.amount : 0),
        balance: monthlyTotals.balance + delta,
      },
    });
    return tx;
  },

  editTransaction: async (id, payload) => {
    const updated = await updateTransaction(id, payload);
    const mapper = (t: Transaction) => (t.id === id ? updated : t);
    set((state) => ({
      transactions: state.transactions.map(mapper),
      allTransactions: state.allTransactions.map(mapper),
    }));
  },

  removeTransaction: async (id) => {
    const tx = get().transactions.find((t) => t.id === id);
    await deleteTransaction(id);
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
      allTransactions: state.allTransactions.filter((t) => t.id !== id),
      monthlyTotals: tx
        ? {
            income: state.monthlyTotals.income - (tx.type === 'income' ? tx.amount : 0),
            expenses: state.monthlyTotals.expenses - (tx.type === 'expense' ? tx.amount : 0),
            balance:
              state.monthlyTotals.balance - (tx.type === 'income' ? tx.amount : -tx.amount),
          }
        : state.monthlyTotals,
    }));
  },
}));
