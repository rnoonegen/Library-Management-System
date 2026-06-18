const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const pinoHttp = require("pino-http");
const apiRoutes = require("./routes");
const { errorHandler, AppError } = require("./middleware");
const logger = require("./utils/logger");

const app = express();

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

function normalizeOrigin(origin) {
  if (!origin) return "";
  return origin.replace(/\/$/, "");
}

function isDevOrigin(origin) {
  if (process.env.NODE_ENV === "production") return false;
  return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
    origin,
  );
}

app.use(
  cors({
    origin(origin, callback) {
      const normalized = normalizeOrigin(origin);
      if (!normalized) {
        return callback(null, true);
      }
      if (
        allowedOrigins.includes(normalized) ||
        isDevOrigin(normalized)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Try again later." },
  }),
);

app.use(
  "/api/auth/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Try again later." },
  }),
);

app.use("/api", apiRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
