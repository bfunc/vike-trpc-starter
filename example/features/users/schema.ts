import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'editor', 'viewer']);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  role: UserRoleSchema,
  department: z.string().max(200).nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export type User = z.infer<typeof UserSchema>;

export const UserCreateInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  role: UserRoleSchema.default('viewer'),
  department: z.string().trim().max(200).optional(),
  is_active: z.boolean().default(true)
});

export type UserCreateInput = z.infer<typeof UserCreateInputSchema>;

export const UserUpdateInputSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(320).optional(),
  role: UserRoleSchema.optional(),
  department: z.string().trim().max(200).nullable().optional(),
  is_active: z.boolean().optional()
});

export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;

export const UsersListQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: UserRoleSchema.optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().min(1).max(1000).default(500),
  offset: z.number().int().min(0).default(0)
});

export type UsersListQuery = z.infer<typeof UsersListQuerySchema>;