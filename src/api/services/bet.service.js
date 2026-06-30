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

export async function getAllBets() {
  const response = await apiClient.get(BET_ENDPOINTS.ROOT, {
    includeAuth: true,
  });

  return unwrapData(response);
}

// 3. API Lấy toàn bộ các bet đặt cược của tài khoản hiện tại
export async function getMyBets() {
  const response = await apiClient.get(BET_ENDPOINTS.MY_BET, {
    includeAuth: true,
  });

  return unwrapData(response);
}
