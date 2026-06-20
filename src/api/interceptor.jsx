import { getAccessToken, getRefreshToken } from "../utils/storage";

function resolveErrorMessage(payload, fallback) {
  if (!payload) {
    return fallback;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }

  return payload.message || payload.error || fallback;
}

export function attachInterceptors(apiClient) {
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
      const message = resolveErrorMessage(
        payload,
        error.message || "Request failed",
      );

      return Promise.reject(new Error(message));
    },
  );

  return apiClient;
}
import { getAccessToken, getRefreshToken } from "../utils/storage";

function resolveErrorMessage(payload, fallback) {
  if (!payload) {
    return fallback;
  }

  if (Array.isArray(payload.message)) {
    return payload.message.join(", ");
  }

  return payload.message || payload.error || fallback;
}

export function attachInterceptors(apiClient) {
  apiClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    console.log("REQUEST URL:", config.url);
    console.log("includeAuth:", config.includeAuth);
    console.log("accessToken:", accessToken);

    if (config.includeAuth && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;

      console.log(
        "Authorization Added:",
        config.headers.Authorization
      );
    }

    if (config.includeRefreshToken && refreshToken) {
      config.headers["x-refresh-token"] = refreshToken;
    }

    delete config.includeAuth;
    delete config.includeRefreshToken;

    return config;
  });

  return apiClient;
}
