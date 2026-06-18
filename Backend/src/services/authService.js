const userRepository = require("../repositories/userRepository");
const refreshTokenRepository = require("../repositories/refreshTokenRepository");
const { AppError } = require("../middleware");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/token");
const { REFRESH_MS } = require("../utils/cookies");

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    userCode: user.user_code,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    gradeLevel: user.grade_level,
    department: user.department,
    status: user.status,
    joinedDate: user.joined_date,
    mustChangePassword: user.must_change_password,
  };
}

function buildTokenPayload(user) {
  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    mustChangePassword: user.must_change_password === true,
  };
}

async function issueSession(user) {
  const accessToken = signToken(buildTokenPayload(user));
  const refreshToken = refreshTokenRepository.generateToken();
  const expiresAt = new Date(Date.now() + REFRESH_MS);
  await refreshTokenRepository.create(user.id, refreshToken, expiresAt);
  return { accessToken, refreshToken, user: toPublicUser(user) };
}

async function login(username, password) {
  if (!username?.trim() || !password) {
    throw new AppError("Username and password are required", 400);
  }

  const user = await userRepository.findByUsername(username.trim());
  if (!user) {
    throw new AppError("Invalid username or password", 401);
  }
  if (user.status !== "active") {
    throw new AppError("Account is inactive", 403);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new AppError("Invalid username or password", 401);
  }

  return issueSession(user);
}

async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Session expired. Please sign in again.", 401);
  }

  const stored = await refreshTokenRepository.findValid(refreshToken);
  if (!stored) {
    throw new AppError("Session expired. Please sign in again.", 401);
  }
  if (stored.status !== "active") {
    throw new AppError("Account is inactive", 403);
  }

  await refreshTokenRepository.revoke(refreshToken);
  const user = await userRepository.findById(stored.user_id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return issueSession(user);
}

async function logout(refreshToken) {
  if (refreshToken) {
    await refreshTokenRepository.revoke(refreshToken);
  }
  return { message: "Logged out successfully" };
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return toPublicUser(user);
}

async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new AppError("Current and new password are required", 400);
  }
  if (newPassword.length < 8) {
    throw new AppError("New password must be at least 8 characters", 400);
  }
  if (!/[A-Z]/.test(newPassword)) {
    throw new AppError("New password must include an uppercase letter", 400);
  }
  if (!/[0-9]/.test(newPassword)) {
    throw new AppError("New password must include a number", 400);
  }

  const user = await userRepository.findAuthById(userId);
  if (!user) throw new AppError("User not found", 404);

  const valid = await verifyPassword(currentPassword, user.password_hash);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, passwordHash, false);
  await refreshTokenRepository.revokeAllForUser(userId);

  const updated = await userRepository.findById(userId);
  const session = await issueSession(updated);

  return {
    message: "Password updated successfully",
    ...session,
  };
}

module.exports = {
  login,
  refreshSession,
  logout,
  getMe,
  changePassword,
  toPublicUser,
};
