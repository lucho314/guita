export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export type TransactionType = 'income' | 'expense';
export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  type: TransactionType;
  created_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM format
  total_limit: number;
  created_at: string;
  budget_categories?: BudgetCategory[];
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  category_id: string;
  amount_limit: number;
  category?: Category;
  spent?: number;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
  created_at: string;
}

// Form types
export interface TransactionFormData {
  amount: string;
  category_id: string;
  description: string;
  transaction_date: string;
  type: TransactionType;
}

export interface BudgetFormData {
  month: string;
  total_limit: string;
  category_limits: { category_id: string; amount_limit: string }[];
}

export interface GoalFormData {
  title: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
  icon: string;
  color: string;
}

export interface MonthlyTotals {
  income: number;
  expenses: number;
  balance: number;
}

export interface WeeklySpending {
  day: string;
  amount: number;
}

export interface BudgetWithSpending extends Budget {
  total_spent: number;
  percentage: number;
  status: 'ok' | 'warning' | 'exceeded';
}
