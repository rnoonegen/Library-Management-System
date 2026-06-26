const { z } = require("zod");

const submitPurchaseOrderSchema = z.object({
  body: z.object({
    book_id: z.coerce.number().int().positive("book_id is required"),
  }),
});

const reviewPurchaseOrderSchema = z.object({
  body: z.object({
    action: z.enum(["ready", "paid", "cancel"]),
    adminNote: z.string().max(500).optional(),
  }),
});

module.exports = {
  submitPurchaseOrderSchema,
  reviewPurchaseOrderSchema,
};
