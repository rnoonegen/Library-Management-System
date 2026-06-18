const { ZodError } = require("zod");
const { AppError } = require("./index");

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) req.params = parsed.params;
      if (parsed.query !== undefined) req.query = parsed.query;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues.map((issue) => issue.message).join("; ");
        return next(new AppError(message, 400));
      }
      next(err);
    }
  };
}

module.exports = { validate };
