const authService = require("../services/authService");

async function login(req, res) {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  res.json(result);
}

async function me(req, res) {
  const user = await authService.getMe(req.user.userId);
  res.json(user);
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(
    req.user.userId,
    currentPassword,
    newPassword,
  );
  res.json(result);
}

module.exports = { login, me, changePassword };
