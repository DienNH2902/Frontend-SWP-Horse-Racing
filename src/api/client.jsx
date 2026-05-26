import axios from "axios";
import { getAccessToken, getRefreshToken } from "../utils/storage";

export const API_BASE_URL = "https://api.horse-racing.io.vn";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function resolveErrorMessage(payload, fallback) {
  if (!payload) {
    return fallback;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }

  return payload.message || payload.error || fallback;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (config.includeAuth && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.includeRefreshToken && refreshToken) {
    config.headers["x-refresh-token"] = refreshToken;
  }

  delete config.includeAuth;
  delete config.includeRefreshToken;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    const message = resolveErrorMessage(payload, error.message || "Request failed");

    return Promise.reject(new Error(message));
  }
);

export async function apiRequest(endpoint, options = {}) {
  const { body, method = "GET", ...config } = options;
  const response = await apiClient.request({
    url: endpoint,
    method,
    data: body,
    ...config,
  });

  return response.data;
}
