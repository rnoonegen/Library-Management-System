const userRepository = require("../repositories/userRepository");
const { AppError } = require("../middleware");
const { hashPassword } = require("../utils/password");
const { toPublicUser } = require("./authService");
const transactionRepository = require("../repositories/transactionRepository");
const { sumOutstandingFine, enrichTransaction } = require("../utils/fineUtils");
const { MAX_ACTIVE_BORROWS } = require("../constants/libraryRules");

const USER_ROLES = ["teacher", "student"];

function buildBorrowStatsMap(userIds, transactions) {
  const map = new Map();
  for (const userId of userIds) {
    map.set(userId, { active_count: 0, outstanding_fine: 0, transactions: [] });
  }
  for (const row of transactions) {
    const entry = map.get(row.user_id);
    if (!entry) continue;
    entry.transactions.push(row);
    if (row.status !== "returned") {
      entry.active_count += 1;
    }
  }
  for (const [, entry] of map) {
    entry.outstanding_fine = sumOutstandingFine(entry.transactions);
    delete entry.transactions;
  }
  return map;
}

function mapUserWithStats(user, statsMap) {
  const stats = statsMap.get(user.id) || { active_count: 0, outstanding_fine: 0 };
  return {
    ...toPublicUser(user),
    user_code: user.user_code,
    joined_date: user.joined_date,
    outstanding_fine: stats.outstanding_fine,
    active_borrow_count: stats.active_count,
    at_borrow_limit: stats.active_count >= MAX_ACTIVE_BORROWS,
  };
}

async function listUsers(query = {}) {
  const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
  const roleFilter =
    query.role && query.role !== "all" ? query.role : null;

  if (roleFilter && !USER_ROLES.includes(roleFilter)) {
    throw new AppError("Invalid role filter", 400);
  }

  const { users, total } = await userRepository.findPaginated(pageNum, limitNum, {
    role: roleFilter,
    search: query.search || "",
  });

  const userIds = users.map((u) => u.id);
  const transactions = await transactionRepository.findByUserIds(userIds);
  const statsMap = buildBorrowStatsMap(userIds, transactions);

  return {
    users: users.map((user) => mapUserWithStats(user, statsMap)),
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  };
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

async function getUserBorrowHistory(userId) {
  const existing = await userRepository.findById(userId);
  if (!existing || !USER_ROLES.includes(existing.role)) {
    throw new AppError("User not found", 404);
  }

  const rows = await transactionRepository.findByUserId(userId);
  const borrows = rows.map((row) => enrichTransaction(row));

  return {
    user: {
      id: existing.id,
      name: existing.name,
      user_code: existing.user_code,
      role: existing.role,
    },
    borrows,
  };
}

async function updateProfile(userId, data) {
  const existing = await userRepository.findById(userId);
  if (!existing) throw new AppError("User not found", 404);
  if (!USER_ROLES.includes(existing.role)) {
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

async function listActiveUsers() {
  const users = await userRepository.findActiveMembers();
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    userCode: user.user_code,
    role: user.role,
    status: user.status,
  }));
}

module.exports = {
  listUsers,
  listActiveUsers,
  createUser,
  getNextCode,
  updateUser,
  deleteUser,
  getUserBorrowHistory,
  updateProfile,
};
