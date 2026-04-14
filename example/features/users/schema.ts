import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  role: z.enum(['admin', 'editor', 'viewer']),
  department: z.string().max(200).nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});
export type User = z.infer<typeof UserSchema>;

export const UserCreateInputSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
  department: z.string().max(200).optional(),
  is_active: z.boolean().default(true)
});
export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;

export const UserUpdateInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().max(320).optional(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  department: z.string().max(200).nullable().optional(),
  is_active: z.boolean().optional()
});
export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;

export const UsersListQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'editor', 'viewer']).optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().min(1).max(1000).default(500),
  offset: z.number().int().min(0).default(0)
});
export type UsersListQuery = z.infer<typeof UsersListQuerySchema>;
