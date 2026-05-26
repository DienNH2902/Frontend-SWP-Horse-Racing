import { apiRequest } from "../client";
import { AUTH_ENDPOINTS } from "../endpoints/auth.endpoint";

function pickFirstValue(source, keys) {
  for (const key of keys) {
    if (source && source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return null;
}

function normalizeLoginResponse(response) {
  const data = response?.data || response;
  const accessToken = pickFirstValue(data, [
    "accessToken",
    "access_token",
    "token",
    "jwt",
  ]);
  const refreshToken = pickFirstValue(data, [
    "refreshToken",
    "refresh_token",
  ]);
  const user = pickFirstValue(data, ["user", "account", "profile"]) || null;

  return {
    accessToken,
    refreshToken,
    raw: response,
    user,
  };
}

export async function login(credentials) {
  const response = await apiRequest(AUTH_ENDPOINTS.LOGIN, {
    method: "POST",
    body: credentials,
  });

  return normalizeLoginResponse(response);
}

export async function getProfile() {
  return apiRequest(AUTH_ENDPOINTS.PROFILE, {
    includeAuth: true,
    includeRefreshToken: true,
  });
}
