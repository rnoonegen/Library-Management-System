const { z } = require("zod");

const borrowBookSchema = z.object({
  body: z
    .object({
      book_id: z.coerce.number().int().positive("book_id is required"),
      user_id: z.coerce.number().int().positive().optional(),
      userId: z.coerce.number().int().positive().optional(),
      borrow_date: z.string().date("borrow_date must be YYYY-MM-DD"),
      due_date: z.string().date("due_date must be YYYY-MM-DD"),
      daily_fine_amount: z.coerce.number().int().min(1).max(10).optional(),
    })
    .refine((data) => data.user_id || data.userId, {
      message: "user_id is required",
      path: ["user_id"],
    }),
});

const updateTransactionSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Invalid id"),
  }),
  body: z.object({
    borrow_date: z.string().date().optional(),
    due_date: z.string().date().optional(),
    daily_fine_amount: z.coerce.number().int().min(1).max(10).optional(),
  }),
});

module.exports = { borrowBookSchema, updateTransactionSchema };
