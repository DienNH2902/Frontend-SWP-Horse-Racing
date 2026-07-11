import { apiClient } from "../client";
import { AUTH_ENDPOINTS } from "../endpoints/auth.endpoint";
import { getAccessToken, getAuthSession } from "../../utils/storage";

let profileCache = null;
let profileCacheToken = null;
let profileRequest = null;

function pickFirstValue(source, keys) {
  if (!source || typeof source !== "object") {
    return null;
  }

  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key];
    }
  }

  return null;
}

function normalizeLoginResponse(response) {
  const data = response?.data || response;
  const authData = pickFirstValue(data, ["data", "result", "auth", "authentication"]) || data;
  const accessToken =
    typeof authData === "string"
      ? authData
      : pickFirstValue(authData, [
        "accessToken",
        "access_token",
        "token",
        "jwt",
      ]);
  const refreshToken = pickFirstValue(authData, [
    "refreshToken",
    "refresh_token",
  ]);
  const user =
    pickFirstValue(authData, ["user", "account", "profile"]) ||
    pickFirstValue(data, ["user", "account", "profile"]) ||
    null;

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export async function login(credentials) {
  profileCache = null;
  profileCacheToken = null;
  profileRequest = null;

  console.log(
    "BASE URL TRONG LOGIN:",
    apiClient.defaults.baseURL
  );

  console.log(
    "FULL URL:",
    apiClient.defaults.baseURL +
    AUTH_ENDPOINTS.LOGIN
  );

  const response = await apiClient.post(
    AUTH_ENDPOINTS.LOGIN,
    credentials
  );

  return normalizeLoginResponse(response.data);
}

export async function getProfile() {
  const accessToken = getAccessToken();

  if (profileCache && profileCacheToken === accessToken) {
    return profileCache;
  }

  if (profileRequest && profileCacheToken === accessToken) {
    return profileRequest;
  }

  profileCacheToken = accessToken;

  try {
    profileRequest = apiClient
      .get(AUTH_ENDPOINTS.PROFILE, {
        includeAuth: true,
        includeRefreshToken: true,
      })
      .then((response) => (
        pickFirstValue(response.data, ["data", "result", "user", "profile"]) ||
        response.data
      ))
      .then((profile) => {
        profileCache = profile;
        return profile;
      })
      .finally(() => {
        profileRequest = null;
      });

    return await profileRequest;
  } catch (error) {
    const sessionUser = getAuthSession()?.user;

    if (sessionUser) {
      profileCache = sessionUser;
      return sessionUser;
    }

    throw error;
  }
}

export async function registerSpectator(payload) {
  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER_SPECTATOR, payload);
  return response.data;
}

export async function registerHorseOwner(payload) {
  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER_HORSE_OWNER, payload);
  return response.data;
}

export async function registerJockey(payload) {
  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER_JOCKEY, payload);
  return response.data;
}

export async function registerReferee(payload) {
  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER_REFEREE, payload);
  return response.data;
}
