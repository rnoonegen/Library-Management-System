const { z } = require("zod");

const optionalDate = z
  .union([z.string().date(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v));

const bookBodySchema = z.object({
  isbn: z.string().trim().min(1, "ISBN is required").max(20),
  title: z.string().trim().min(1, "Title is required").max(255),
  author: z.string().trim().min(1, "Author is required").max(255),
  publisher: z.string().max(255).optional().nullable(),
  qty: z.coerce.number().int().min(0).max(10000).optional().default(1),
  price: z.coerce.number().min(0).optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  abstract: z.string().max(5000).optional().nullable(),
  date_of_publication: optionalDate,
  grade_level: z.string().max(50).optional().nullable(),
});

const createBookSchema = z.object({
  body: bookBodySchema,
});

const updateBookSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Invalid id"),
  }),
  body: bookBodySchema.partial(),
});

module.exports = { createBookSchema, updateBookSchema };
