import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'El monto es requerido')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'El monto debe ser mayor a 0'),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().optional(),
  transaction_date: z.string().min(1, 'La fecha es requerida'),
  type: z.enum(['income', 'expense']),
});

export const budgetSchema = z.object({
  month: z.string().min(1, 'El mes es requerido'),
  total_limit: z
    .string()
    .min(1, 'El límite total es requerido')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'El límite debe ser mayor a 0'),
  category_limits: z.array(
    z.object({
      category_id: z.string(),
      amount_limit: z.string(),
    })
  ),
});

export const goalSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(50, 'Máximo 50 caracteres'),
  target_amount: z
    .string()
    .min(1, 'El monto objetivo es requerido')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'El monto debe ser mayor a 0'),
  current_amount: z
    .string()
    .refine((v) => v === '' || (!isNaN(parseFloat(v)) && parseFloat(v) >= 0), 'Monto inválido'),
  target_date: z.string().optional(),
  icon: z.string().min(1, 'Selecciona un ícono'),
  color: z.string().min(1, 'Selecciona un color'),
});

export const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  display_name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
export type BudgetFormValues = z.infer<typeof budgetSchema>;
export type GoalFormValues = z.infer<typeof goalSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
