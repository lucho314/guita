import { supabase } from './supabase';
import { Goal } from '@/types/database';

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Goal[];
}

export async function createGoal(
  userId: string,
  payload: Omit<Goal, 'id' | 'user_id' | 'created_at'>
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...payload, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Goal;
}

export async function updateGoal(id: string, payload: Partial<Goal>): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Goal;
}

export async function addGoalContribution(id: string, amount: number): Promise<Goal> {
  const { data: current } = await supabase
    .from('goals')
    .select('current_amount')
    .eq('id', id)
    .single();

  const newAmount = (current?.current_amount ?? 0) + amount;
  return updateGoal(id, { current_amount: newAmount });
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}
