const { z } = require("zod");

const submitBorrowRequestSchema = z.object({
  body: z.object({
    book_id: z.coerce.number().int().positive("book_id is required"),
  }),
});

const submitExtensionRequestSchema = z.object({
  body: z.object({
    borrow_id: z.coerce.number().int().positive("borrow_id is required"),
    reason: z.string().max(500).optional(),
  }),
});

const reviewBorrowRequestSchema = z.object({
  body: z.object({
    action: z.enum(["fulfill", "cancel"]),
    adminNote: z.string().max(500).optional(),
  }),
});

const reviewExtensionRequestSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject"]),
    adminNote: z.string().max(500).optional(),
  }),
});

module.exports = {
  submitBorrowRequestSchema,
  submitExtensionRequestSchema,
  reviewBorrowRequestSchema,
  reviewExtensionRequestSchema,
};
