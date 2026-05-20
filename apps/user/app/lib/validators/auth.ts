import { z } from "zod";

/* ---------------- SIGNUP (PHONE ONLY) ---------------- */
export const signupSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
});

/* ---------------- VERIFY OTP ---------------- */
export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),

  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

/* ---------------- SET PASSWORD ---------------- */
export const setCredentialsSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

/* ---------------- LOGIN ---------------- */
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, "Username must be at least 3 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

/* ---------------- Regist ---------------- */
export const registerSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

/* ---------------- forgot ---------------- */
export const forgotSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
});

/* ---------------- resetPassword ---------------- */
export const resetPasswordSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
    password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

