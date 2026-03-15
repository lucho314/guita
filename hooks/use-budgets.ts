import { useEffect } from 'react';
import { useBudgetStore } from '@/store/budget-store';
import { useAuth } from './use-auth';
import { getBudgetStatusLabel, getBudgetStatusColor } from '@/services/analytics';

export function useBudgets(month?: string) {
  const { user } = useAuth();
  const { currentBudget, isLoading, fetchCurrent, addBudget, updateCategoryLimit, removeBudget } =
    useBudgetStore();

  useEffect(() => {
    if (user?.id) {
      fetchCurrent(user.id, month);
    }
  }, [user?.id, month]);

  const statusLabel = currentBudget ? getBudgetStatusLabel(currentBudget.status) : null;
  const statusColor = currentBudget ? getBudgetStatusColor(currentBudget.status) : null;

  return {
    currentBudget,
    isLoading,
    statusLabel,
    statusColor,
    refresh: () => user && fetchCurrent(user.id, month),
    addBudget: (
      month: string,
      totalLimit: number,
      categoryLimits: { category_id: string; amount_limit: number }[]
    ) => (user ? addBudget(user.id, month, totalLimit, categoryLimits) : Promise.reject()),
    updateCategoryLimit,
    removeBudget,
  };
}
