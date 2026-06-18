const userService = require("../services/userService");

async function listUsers(req, res) {
  const users = await userService.listUsers(req.query.role);
  res.json(users);
}

async function createUser(req, res) {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
}

async function nextCode(req, res) {
  const result = await userService.getNextCode(req.params.role);
  res.json(result);
}

async function updateUser(req, res) {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
}

async function deleteUser(req, res) {
  await userService.deleteUser(req.params.id);
  res.json({ message: "User deleted successfully" });
}

async function getUserBorrows(req, res) {
  const result = await userService.getUserBorrowHistory(req.params.id);
  res.json(result);
}

async function updateProfile(req, res) {
  const user = await userService.updateProfile(req.user.userId, req.body);
  res.json(user);
}

module.exports = {
  listUsers,
  createUser,
  nextCode,
  updateUser,
  deleteUser,
  getUserBorrows,
  updateProfile,
};
