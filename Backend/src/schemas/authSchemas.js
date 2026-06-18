const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

const loginSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1, "Username is required").max(20),
    password: z.string().min(1, "Password is required"),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
  }),
});

module.exports = { loginSchema, changePasswordSchema, passwordSchema };
