import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid mobile number"),

  line1: z
    .string()
    .trim()
    .min(10, "Enter complete address")
    .max(250),

  line2: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal("")),

  city: z
    .string()
    .trim()
    .min(2, "City is required"),

  state: z
    .string()
    .trim()
    .min(2, "State is required"),

  pincode: z
    .string()
    .trim()
    .length(6, "Pincode must be 6 digits")
    .regex(/^\d+$/, "Pincode must contain only numbers"),

  type: z.enum([
    "HOME",
    "WORK",
    "OTHER",
  ]),

  isDefault: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;