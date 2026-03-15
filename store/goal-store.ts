import { create } from 'zustand';
import { Goal } from '@/types/database';
import {
  fetchGoals,
  createGoal,
  updateGoal,
  addGoalContribution,
  deleteGoal,
} from '@/services/goals';

interface GoalState {
  goals: Goal[];
  isLoading: boolean;
  fetch: (userId: string) => Promise<void>;
  addGoal: (userId: string, payload: Omit<Goal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editGoal: (id: string, payload: Partial<Goal>) => Promise<void>;
  contribute: (id: string, amount: number) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,

  fetch: async (userId) => {
    set({ isLoading: true });
    try {
      const goals = await fetchGoals(userId);
      set({ goals, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addGoal: async (userId, payload) => {
    const goal = await createGoal(userId, payload);
    set((state) => ({ goals: [goal, ...state.goals] }));
  },

  editGoal: async (id, payload) => {
    const updated = await updateGoal(id, payload);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
  },

  contribute: async (id, amount) => {
    const updated = await addGoalContribution(id, amount);
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? updated : g)),
    }));
  },

  removeGoal: async (id) => {
    await deleteGoal(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));
