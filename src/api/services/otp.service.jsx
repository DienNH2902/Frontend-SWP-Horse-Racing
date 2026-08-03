import { apiClient } from "../client";
import { OTP_ENDPOINTS } from "../endpoints/otp.endpoint";

export async function requestResetPassword(payload) {
  const response = await apiClient.post(OTP_ENDPOINTS.REQUEST_RESET, payload);
  return response.data;
}

export async function resetPassword(payload) {
  const response = await apiClient.post(OTP_ENDPOINTS.RESET_PASSWORD, payload);
  return response.data;
}
