import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const WorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
  description: z.string().optional(),
});

export const ChannelSchema = z.object({
  name: z.string().min(2).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, hyphens"),
  description: z.string().optional(),
  isPrivate: z.boolean().default(false),
});

export const MessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
});

export const TaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

export const ProfileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().max(200).optional(),
  image: z.string().url().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type WorkspaceInput = z.infer<typeof WorkspaceSchema>;
export type ChannelInput = z.infer<typeof ChannelSchema>;
export type TaskInput = z.infer<typeof TaskSchema>;
