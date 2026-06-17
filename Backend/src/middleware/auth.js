const { AppError } = require("./index");
const { verifyToken } = require("../utils/token");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const payload = verifyToken(header.slice(7));
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
