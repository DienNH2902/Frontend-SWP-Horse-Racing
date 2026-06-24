import { apiClient } from "../client";
import { PAYMENT_ENDPOINTS } from "../endpoints/wallet.endpoint";

export async function createDepositPayment(amount) {
  const response = await apiClient.post(
    PAYMENT_ENDPOINTS.DEPOSIT,
    {
      amount: amount,
      bankCode: "NCB", // Ngân hàng NCB mặc định hệ thống sandbox
    },
    {
      includeAuth: true,
    },
  );
  return response?.data || response?.result || response;
}