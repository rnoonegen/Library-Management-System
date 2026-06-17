const userRepository = require("../repositories/userRepository");
const { AppError } = require("../middleware");
const { hashPassword, verifyPassword } = require("../utils/password");
const { signToken } = require("../utils/token");

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

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
  });

  return { token, user: toPublicUser(user) };
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
  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  const user = await userRepository.findAuthById(userId);
  if (!user) throw new AppError("User not found", 404);

  const valid = await verifyPassword(currentPassword, user.password_hash);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, passwordHash, false);
  return { message: "Password updated successfully" };
}

module.exports = { login, getMe, changePassword, toPublicUser };
