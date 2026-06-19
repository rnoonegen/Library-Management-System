const ACCESS_COOKIE = "library_access";
const REFRESH_COOKIE = "library_refresh";
const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

function isSecureCookie() {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

function cookieSameSite() {
  if (process.env.COOKIE_SAME_SITE === "none") return "none";
  if (process.env.COOKIE_SAME_SITE === "lax") return "lax";
  if (process.env.COOKIE_SAME_SITE === "strict") return "strict";
  return process.env.NODE_ENV === "production" ? "lax" : "lax";
}

function cookieBase() {
  return {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: cookieSameSite(),
    path: "/",
  };
}

function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...cookieBase(),
    maxAge: ACCESS_MS,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...cookieBase(),
    maxAge: REFRESH_MS,
  });
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, cookieBase());
  res.clearCookie(REFRESH_COOKIE, cookieBase());
}

function getAccessToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.[ACCESS_COOKIE] || null;
}

function getRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE] || null;
}

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MS,
  REFRESH_MS,
  setAuthCookies,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
};
