import { Category } from '@/types/database';

export const CATEGORIES: Category[] = [
  { id: 'supermercado', label: 'Supermercado', icon: 'shopping-cart', color: '#22C55E', type: 'expense' },
  { id: 'transporte', label: 'Transporte', icon: 'directions-car', color: '#3B82F6', type: 'expense' },
  { id: 'comida', label: 'Comida', icon: 'restaurant', color: '#F59E0B', type: 'expense' },
  { id: 'salud', label: 'Salud', icon: 'local-hospital', color: '#EF4444', type: 'expense' },
  { id: 'suscripciones', label: 'Suscripciones', icon: 'subscriptions', color: '#8B5CF6', type: 'expense' },
  { id: 'entretenimiento', label: 'Entretenimiento', icon: 'movie', color: '#EC4899', type: 'expense' },
  { id: 'ropa', label: 'Ropa', icon: 'checkroom', color: '#F97316', type: 'expense' },
  { id: 'educacion', label: 'Educación', icon: 'school', color: '#06B6D4', type: 'expense' },
  { id: 'hogar', label: 'Hogar', icon: 'home', color: '#84CC16', type: 'expense' },
  { id: 'tecnologia', label: 'Tecnología', icon: 'devices', color: '#6366F1', type: 'expense' },
  { id: 'viajes', label: 'Viajes', icon: 'flight', color: '#14B8A6', type: 'expense' },
  { id: 'mascotas', label: 'Mascotas', icon: 'pets', color: '#A78BFA', type: 'expense' },
  { id: 'salario', label: 'Salario', icon: 'account-balance-wallet', color: '#22C55E', type: 'income' },
  { id: 'freelance', label: 'Freelance', icon: 'work', color: '#3B82F6', type: 'income' },
  { id: 'inversiones', label: 'Inversiones', icon: 'trending-up', color: '#F59E0B', type: 'income' },
  { id: 'regalo', label: 'Regalo', icon: 'card-giftcard', color: '#EC4899', type: 'income' },
  { id: 'otros_ingreso', label: 'Otros', icon: 'attach-money', color: '#6B7280', type: 'income' },
  { id: 'deporte', label: 'Deporte', icon: 'fitness-center', color: '#10B981', type: 'expense' },
  { id: 'otros_gasto', label: 'Otros', icon: 'more-horiz', color: '#6B7280', type: 'expense' },
];

export function getCategoriesByType(type: 'income' | 'expense'): Category[] {
  return CATEGORIES.filter((c) => c.type === type || c.type === 'both');
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
