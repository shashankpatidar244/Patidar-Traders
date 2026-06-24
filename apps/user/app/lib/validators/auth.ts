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
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* ---------------- LOGIN ---------------- */
export const loginSchema = z.object({
  identifier: z.string().min(3, "Username must be at least 3 characters"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* ---------------- Regist ---------------- */
export const registerSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
  username: z.string().min(3, "Username must be at least 3 characters"),

  password: z.string().min(6, "Password must be at least 6 characters"),
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
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* ---------------- update profile ---------------- */
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number is too long")
    .regex(/^[0-9]+$/, "Phone number must contain only digits"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/* ---------------- CHANGE PASSWORD ---------------- */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z.string().min(6, "Password must be at least 6 characters"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const changePasswordApiSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
