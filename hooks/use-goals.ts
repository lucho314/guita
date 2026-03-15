import { useEffect } from 'react';
import { useGoalStore } from '@/store/goal-store';
import { useAuth } from './use-auth';
import { Goal } from '@/types/database';

export function useGoals() {
  const { user } = useAuth();
  const { goals, isLoading, fetch, addGoal, editGoal, contribute, removeGoal } = useGoalStore();

  useEffect(() => {
    if (user?.id) {
      fetch(user.id);
    }
  }, [user?.id]);

  // Enrich goals with progress
  const goalsWithProgress = goals.map((g) => ({
    ...g,
    progress: g.target_amount > 0 ? g.current_amount / g.target_amount : 0,
    remaining: g.target_amount - g.current_amount,
    isCompleted: g.current_amount >= g.target_amount,
  }));

  return {
    goals: goalsWithProgress,
    isLoading,
    refresh: () => user && fetch(user.id),
    addGoal: (payload: Omit<Goal, 'id' | 'user_id' | 'created_at'>) =>
      user ? addGoal(user.id, payload) : Promise.reject(),
    editGoal,
    contribute,
    removeGoal,
  };
}
