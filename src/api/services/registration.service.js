import { apiClient } from "../client";
import { REGISTRATION_ENDPOINTS } from "../endpoints/registration.endpoint";

function unwrapData(response) {
  const data = response?.data;

  return data?.data || data?.result || data?.registration || data;
}

export async function createRegistration(payload) {
  const response = await apiClient.post(REGISTRATION_ENDPOINTS.ROOT, payload, {
    includeAuth: true,
  });

  return unwrapData(response);
}
