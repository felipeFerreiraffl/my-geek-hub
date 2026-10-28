import { z } from "zod";

export const emailSchema = z.email();

export const passwordSchema = z
  .string()
  .min(8)
  .regex(/^(?=.*[A-Z])(?=.*[0-9])/);

export const usernameSchema = z.string().trim().min(3).max(30);

// Strict: unknown fields (id, createdAt...) are rejected instead of reaching the database
export const UserUpdateSchema = z.strictObject({
  username: usernameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
});
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
