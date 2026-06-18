const pino = require("pino");

const isTest = process.env.NODE_ENV === "test";

const logger = pino({
  level: process.env.LOG_LEVEL || (isTest ? "silent" : "info"),
  transport:
    !isTest && process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

module.exports = logger;
