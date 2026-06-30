import { apiClient } from "../client";
import { BET_ENDPOINTS } from "../endpoints/bet.endpoint";

function unwrapData(response) {
  const data = response?.data;

  return data?.data || data?.result || data?.bet || data;
}

export async function createBet(payload) {
  const response = await apiClient.post(BET_ENDPOINTS.ROOT, payload, {
    includeAuth: true,
  });

  return unwrapData(response);
}
