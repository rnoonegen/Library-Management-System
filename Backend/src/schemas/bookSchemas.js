const { z } = require("zod");
const { BOOK_TYPES } = require("../constants/bookCatalog");

const BOOK_TYPE_VALUES = BOOK_TYPES;

const todayISO = () => new Date().toISOString().slice(0, 10);

const optionalPastDate = z
  .union([z.string().date(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => !v || v <= todayISO(), {
    message: "Publication date cannot be in the future",
  });

const bookBodySchema = z.object({
  isbn: z.string().trim().min(1, "ISBN is required").max(20),
  title: z.string().trim().min(1, "Title is required").max(255),
  author: z.string().trim().min(1, "Author is required").max(255),
  publisher: z.string().max(255).optional().nullable(),
  qty: z.coerce.number().int().min(0).max(10000).optional().default(1),
  price: z.coerce.number().min(0).optional().nullable(),
  subject: z.string().max(255).optional().nullable(),
  language: z.string().max(50).optional().nullable(),
  abstract: z.string().max(5000).optional().nullable(),
  date_of_publication: optionalPastDate,
  grade_level: z.string().max(50).optional().nullable(),
  book_type: z.enum(BOOK_TYPE_VALUES).optional().default("borrow"),
});

const createBookSchema = z.object({
  body: bookBodySchema.extend({
    qty: z.coerce.number().int().min(1, "Quantity must be at least 1").max(10000).optional().default(1),
  }),
});

const updateBookSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Invalid id"),
  }),
  body: bookBodySchema.partial(),
});

const bookQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    language: z.union([z.string(), z.array(z.string())]).optional(),
    book_type: z.enum(BOOK_TYPE_VALUES).optional(),
    sort: z.enum(["title", "price_asc", "price_desc"]).optional().default("title"),
  }),
});

const bookTypeCountQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    subject: z.union([z.string(), z.array(z.string())]).optional(),
    language: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

module.exports = {
  createBookSchema,
  updateBookSchema,
  bookQuerySchema,
  bookTypeCountQuerySchema,
};
