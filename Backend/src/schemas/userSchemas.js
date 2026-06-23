const { z } = require("zod");
const { passwordSchema } = require("./authSchemas");

const optionalPhoneSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z
    .union([
      z.null(),
      z.string().regex(/^\d{10}$/, "Phone number must be a 10-digit number"),
    ])
    .optional(),
);

const createUserSchema = z.object({
  body: z.object({
    role: z.enum(["teacher", "student"]),
    name: z.string().trim().min(1, "Name is required").max(255),
    email: z
      .union([z.literal(""), z.string().email("Invalid email")])
      .optional(),
    phone: optionalPhoneSchema,
    address: z.string().max(1000).optional().nullable(),
    joined_date: z.string().optional(),
    password: passwordSchema,
  }),
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(255).optional(),
    email: z
      .union([z.literal(""), z.string().email("Invalid email")])
      .optional(),
    phone: optionalPhoneSchema,
    address: z.string().max(1000).optional().nullable(),
    joined_date: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    grade_level: z.string().max(50).optional().nullable(),
    department: z.string().max(100).optional().nullable(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required").max(255),
    email: z
      .union([z.literal(""), z.string().email("Invalid email")])
      .optional(),
    phone: optionalPhoneSchema,
    address: z.string().max(1000).optional().nullable(),
    grade_level: z.string().max(50).optional().nullable(),
    department: z.string().max(100).optional().nullable(),
  }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
};
