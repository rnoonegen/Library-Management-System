const { AppError } = require("./index");
const { verifyToken } = require("../utils/token");
const { getAccessToken } = require("../utils/cookies");

const PASSWORD_CHANGE_EXEMPT = new Set([
  "/auth/me",
  "/auth/change-password",
  "/auth/refresh",
  "/auth/logout",
]);

function authenticate(req, res, next) {
  const token = getAccessToken(req);
  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      mustChangePassword: payload.mustChangePassword === true,
    };

    if (
      req.user.mustChangePassword &&
      !PASSWORD_CHANGE_EXEMPT.has(req.path)
    ) {
      return next(
        new AppError("You must change your password before continuing", 403),
      );
    }

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
