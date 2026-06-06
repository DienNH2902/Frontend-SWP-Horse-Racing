
const AUTH_STORAGE_KEY = "goldenhoof_auth";
const ACCESS_TOKEN_COOKIE_KEY = "goldenhoof_access_token";
const REFRESH_TOKEN_COOKIE_KEY = "goldenhoof_refresh_token";

function getStorage(persistent = true) {
  return persistent ? window.localStorage : window.sessionStorage;
}

function setCookie(name, value, options = {}) {
  const segments = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "path=/",
    "SameSite=Lax",
  ];

  if (options.maxAge) {
    segments.push(`max-age=${options.maxAge}`);
  }

  if (window.location.protocol === "https:") {
    segments.push("Secure");
  }

  document.cookie = segments.join("; ");
}

function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

function getCookie(name) {
  const encodedName = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(encodedName));

  return cookie ? decodeURIComponent(cookie.slice(encodedName.length)) : null;
}

export function saveAuthSession(authSession, persistent = true) {
  const storage = getStorage(persistent);
  const otherStorage = getStorage(!persistent);
  const cookieOptions = {
    maxAge: persistent ? 60 * 60 * 24 * 30 : undefined,
  };
  const sessionWithoutTokens = {
    isAuthenticated: Boolean(authSession?.accessToken),
    user: authSession?.user || null,
  };

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionWithoutTokens));
  otherStorage.removeItem(AUTH_STORAGE_KEY);

  if (authSession?.accessToken) {
    setCookie(ACCESS_TOKEN_COOKIE_KEY, authSession.accessToken, cookieOptions);
  }

  if (authSession?.refreshToken) {
    setCookie(REFRESH_TOKEN_COOKIE_KEY, authSession.refreshToken, cookieOptions);
  }
}

export function getAuthSession() {
  const rawSession =
    window.localStorage.getItem(AUTH_STORAGE_KEY) ||
    window.sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  deleteCookie(ACCESS_TOKEN_COOKIE_KEY);
  deleteCookie(REFRESH_TOKEN_COOKIE_KEY);
}

export function getAccessToken() {
  return getCookie(ACCESS_TOKEN_COOKIE_KEY);
}

export function getRefreshToken() {
  return getCookie(REFRESH_TOKEN_COOKIE_KEY);
}
