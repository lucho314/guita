import { create } from 'zustand';
import { Budget, BudgetWithSpending } from '@/types/database';
import {
  fetchCurrentBudget,
  createBudget,
  updateBudgetCategoryLimit,
  deleteBudget,
} from '@/services/budgets';

interface BudgetState {
  currentBudget: BudgetWithSpending | null;
  isLoading: boolean;
  fetchCurrent: (userId: string, month?: string) => Promise<void>;
  addBudget: (
    userId: string,
    month: string,
    totalLimit: number,
    categoryLimits: { category_id: string; amount_limit: number }[]
  ) => Promise<void>;
  updateCategoryLimit: (budgetCategoryId: string, amountLimit: number) => Promise<void>;
  removeBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  currentBudget: null,
  isLoading: false,

  fetchCurrent: async (userId, month) => {
    set({ isLoading: true });
    try {
      const budget = await fetchCurrentBudget(userId, month);
      set({ currentBudget: budget, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addBudget: async (userId, month, totalLimit, categoryLimits) => {
    await createBudget(userId, month, totalLimit, categoryLimits);
    await get().fetchCurrent(userId, month);
  },

  updateCategoryLimit: async (budgetCategoryId, amountLimit) => {
    await updateBudgetCategoryLimit(budgetCategoryId, amountLimit);
    const budget = get().currentBudget;
    if (budget?.user_id) {
      await get().fetchCurrent(budget.user_id);
    }
  },

  removeBudget: async (id) => {
    await deleteBudget(id);
    set({ currentBudget: null });
  },
}));
