import { z } from "zod";

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name is too long")
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      "Full name can only contain letters"
    ),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Mobile number must start with 6, 7, 8 or 9 and contain 10 digits"
    ),

  line1: z
    .string()
    .trim()
    .min(
      10,
      "Please enter a complete address (minimum 10 characters)"
    )
    .max(
      250,
      "Address cannot exceed 250 characters"
    ),

  line2: z
    .string()
    .trim()
    .max(
      150,
      "Landmark cannot exceed 150 characters"
    )
    .optional()
    .or(z.literal("")),

    city: z
    .string()
    .trim()
    .min(2, "Please enter city name")
    .max(100, "City name is too long")
    .regex(
      /^[A-Za-z\s.-]+$/,
      "City name can contain only letters"
    ),

    state: z
    .string()
    .trim()
    .min(2, "Please enter state name")
    .max(100, "State name is too long")
    .regex(
      /^[A-Za-z\s.-]+$/,
      "State name can contain only letters"
    ),

  pincode: z
    .string()
    .trim()
    .regex(
      /^[1-9][0-9]{5}$/,
      "Enter a valid 6-digit pincode"
    ),

    type: z.enum(
      ["HOME", "WORK", "OTHER"],
      {
        message: "Please select address type",
      }
    ),

  isDefault: z.boolean(),
});

export type AddressFormData = z.infer<typeof addressSchema>;