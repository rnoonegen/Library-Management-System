const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

if (!SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  console.warn("⚠ Using dev JWT secret — never use in production");
}

const EFFECTIVE_SECRET =
  SECRET || "library-dev-secret-change-in-production";

function signToken(payload) {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, EFFECTIVE_SECRET);
}

module.exports = { signToken, verifyToken };
