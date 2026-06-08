import { apiClient } from "../client";
import { AUTH_ENDPOINTS } from "../endpoints/auth.endpoint";

const MOCK_USERS_STORAGE_KEY = "goldenhoof_mock_users";

const defaultMockUsers = [
  {
    id: "spec-1",
    email: "spectator@goldenhoof.com",
    password: "spec123",
    fullName: "GoldenHoof Spectator",
    phoneNumber: "0123456789",
    gender: 1,
    address: "Royal Turf Club",
    role: "Spectator",
  },
  {
    id: "jockey-1",
    email: "jockey@goldenhoof.com",
    password: "jockey123",
    fullName: "GoldenHoof Jockey",
    phoneNumber: "0987654321",
    gender: 1,
    address: "Valley Racecourse",
    height: 1.68,
    weight: 52,
    role: "Jockey",
  },
];

const delay = (value, ms = 180) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });

function getMockUsers() {
  const rawUsers = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY);

  if (!rawUsers) {
    return defaultMockUsers;
  }

  try {
    return [...defaultMockUsers, ...JSON.parse(rawUsers)];
  } catch {
    window.localStorage.removeItem(MOCK_USERS_STORAGE_KEY);
    return defaultMockUsers;
  }
}

function saveMockUser(payload) {
  const rawUsers = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY);
  const users = rawUsers ? JSON.parse(rawUsers) : [];
  const normalizedEmail = payload.email.trim().toLowerCase();

  if (getMockUsers().some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error("Email already exists");
  }

  const user = {
    ...payload,
    id: `${payload.role.toLowerCase()}-${Date.now()}`,
    email: normalizedEmail,
  };

  users.push(user);
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users));

  return user;
}

function createMockAuthSession(user) {
  const { password, ...safeUser } = user;

  return {
    accessToken: `mock-access-token-${safeUser.id}`,
    refreshToken: `mock-refresh-token-${safeUser.id}`,
    user: safeUser,
  };
}

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
  const email = credentials.email.trim().toLowerCase();
  const user = getMockUsers().find(
    (item) => item.email.toLowerCase() === email && item.password === credentials.password
  );

  if (user) {
    return delay(createMockAuthSession(user));
  }

  if (!apiClient.defaults.baseURL) {
    throw new Error("Invalid email or password");
  }

  const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);

  return normalizeLoginResponse(response.data);
}

export async function getProfile() {
  const response = await apiClient.get(AUTH_ENDPOINTS.PROFILE, {
    includeAuth: true,
    includeRefreshToken: true,
  });

  return response.data;
}

export async function registerSpectator(payload) {
  if (!apiClient.defaults.baseURL) {
    return delay(saveMockUser(payload));
  }

  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER_SPECTATOR, payload);
  return response.data;
}

export async function registerHorseOwner(payload) {
  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER_HORSE_OWNER, payload);
  return response.data;
}

export async function registerJockey(payload) {
  if (!apiClient.defaults.baseURL) {
    return delay(saveMockUser(payload));
  }

  const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER_JOCKEY, payload);
  return response.data;
}
