
const AUTH_STORAGE_KEY = "goldenhoof_auth";

function getStorage(persistent = true) {
  return persistent ? window.localStorage : window.sessionStorage;
}

export function saveAuthSession(authSession, persistent = true) {
  const storage = getStorage(persistent);
  const otherStorage = getStorage(!persistent);

  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
  otherStorage.removeItem(AUTH_STORAGE_KEY);
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
}

export function getAccessToken() {
  return getAuthSession()?.accessToken || null;
}

export function getRefreshToken() {
  return getAuthSession()?.refreshToken || null;
}
