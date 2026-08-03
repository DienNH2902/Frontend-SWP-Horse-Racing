import { apiClient } from "../client";
import { STREAK_ENDPOINTS } from "../endpoints/streak.endpoint";

function unwrapData(response) {
  const data = response?.data;
  return data?.data || data?.result || data;
}

//Lấy trạng thái chuỗi đăng nhập (Streak) của tài khoản hiện tại
export async function getMyStreakStatus() {
  const response = await apiClient.get(STREAK_ENDPOINTS.MY_STATUS, {
    includeAuth: true,
  });

  return unwrapData(response);
}
