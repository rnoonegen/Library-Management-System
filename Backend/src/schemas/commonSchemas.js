const { z } = require("zod");

const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Invalid id"),
  }),
});

const roleParamSchema = z.object({
  params: z.object({
    role: z.enum(["teacher", "student"], {
      errorMap: () => ({ message: "Role must be teacher or student" }),
    }),
  }),
});

const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    role: z.enum(["all", "teacher", "student"]).optional(),
    status: z.string().optional(),
  }),
});

const transactionQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    status: z.enum(["all", "borrowed", "overdue", "returned"]).optional(),
  }),
});

module.exports = {
  idParamSchema,
  roleParamSchema,
  paginationQuerySchema,
  transactionQuerySchema,
};
