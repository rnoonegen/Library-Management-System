const authService = require("../services/authService");
const { setAuthCookies, clearAuthCookies, getRefreshToken } = require("../utils/cookies");

async function login(req, res) {
  const { username, password } = req.body;
  const session = await authService.login(username, password);
  setAuthCookies(res, session.accessToken, session.refreshToken);
  res.json({ user: session.user });
}

async function refresh(req, res) {
  const session = await authService.refreshSession(getRefreshToken(req));
  setAuthCookies(res, session.accessToken, session.refreshToken);
  res.json({ user: session.user });
}

async function logout(req, res) {
  await authService.logout(getRefreshToken(req));
  clearAuthCookies(res);
  res.json({ message: "Logged out successfully" });
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
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ message: result.message, user: result.user });
}

module.exports = { login, refresh, logout, me, changePassword };
