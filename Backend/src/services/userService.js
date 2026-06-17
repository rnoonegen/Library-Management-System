const userRepository = require("../repositories/userRepository");
const { AppError } = require("../middleware");
const { hashPassword } = require("../utils/password");
const { toPublicUser } = require("./authService");
const transactionRepository = require("../repositories/transactionRepository");
const { sumOutstandingFine } = require("../utils/fineUtils");

const USER_ROLES = ["teacher", "student"];

async function listUsers(role) {
  if (role && !USER_ROLES.includes(role)) {
    throw new AppError("Invalid role filter", 400);
  }
  const users = await userRepository.findAll({ role });
  const filtered = users.filter((u) => USER_ROLES.includes(u.role));
  const withFine = await Promise.all(
    filtered.map(async (u) => {
      const transactions = await transactionRepository.findByUserId(u.id);
      return {
        ...toPublicUser(u),
        user_code: u.user_code,
        joined_date: u.joined_date,
        outstanding_fine: sumOutstandingFine(transactions),
      };
    }),
  );
  return withFine;
}

async function createUser(data) {
  const role = data.role;
  if (!USER_ROLES.includes(role)) {
    throw new AppError("Role must be teacher or student", 400);
  }
  if (!data.name?.trim()) {
    throw new AppError("Name is required", 400);
  }
  if (!data.password) {
    throw new AppError("Password is required", 400);
  }

  const prefix = role === "teacher" ? "T" : "S";
  const userCode = await userRepository.getNextUserCode(prefix);
  const passwordHash = await hashPassword(data.password);

  const id = await userRepository.create({
    username: userCode,
    password_hash: passwordHash,
    role,
    user_code: userCode,
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone || null,
    address: data.address || null,
    grade_level: data.grade_level || null,
    department: data.department || null,
    joined_date: data.joined_date || new Date().toISOString().split("T")[0],
    status: "active",
    must_change_password: true,
  });

  const user = await userRepository.findById(id);
  return toPublicUser(user);
}

async function getNextCode(role) {
  if (!USER_ROLES.includes(role)) {
    throw new AppError("Role must be teacher or student", 400);
  }
  const prefix = role === "teacher" ? "T" : "S";
  return { code: await userRepository.getNextUserCode(prefix) };
}

async function updateUser(userId, data) {
  const existing = await userRepository.findById(userId);
  if (!existing || !USER_ROLES.includes(existing.role)) {
    throw new AppError("User not found", 404);
  }

  const merged = {
    name: data.name ?? existing.name,
    email: data.email ?? existing.email,
    phone: data.phone ?? existing.phone,
    address: data.address ?? existing.address,
    grade_level: data.grade_level ?? existing.grade_level,
    department: data.department ?? existing.department,
    joined_date: data.joined_date ?? existing.joined_date,
    status: data.status ?? existing.status,
  };

  await userRepository.update(userId, merged);
  const user = await userRepository.findById(userId);
  return {
    ...toPublicUser(user),
    user_code: user.user_code,
    joined_date: user.joined_date,
  };
}

async function deleteUser(userId) {
  const existing = await userRepository.findById(userId);
  if (!existing || !USER_ROLES.includes(existing.role)) {
    throw new AppError("User not found", 404);
  }
  return userRepository.remove(userId);
}

async function updateProfile(userId, data) {
  const existing = await userRepository.findById(userId);
  if (!existing) throw new AppError("User not found", 404);
  if (!["teacher", "student"].includes(existing.role)) {
    throw new AppError("Only teachers and students can update profile here", 403);
  }
  if (!data.name?.trim()) {
    throw new AppError("Name is required", 400);
  }

  await userRepository.update(userId, {
    name: data.name.trim(),
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    address: data.address?.trim() || null,
    grade_level: data.grade_level?.trim() || null,
    department: data.department?.trim() || null,
    joined_date: existing.joined_date,
    status: existing.status,
  });

  const user = await userRepository.findById(userId);
  return toPublicUser(user);
}

module.exports = {
  listUsers,
  createUser,
  getNextCode,
  updateUser,
  deleteUser,
  updateProfile,
};
