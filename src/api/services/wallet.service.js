import { apiClient } from "../client";
import { PAYMENT_ENDPOINTS } from "../endpoints/wallet.endpoint";

function unwrapData(response) {
  const data = response?.data;

  return data?.data || data?.result || data?.wallet || data;
}

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

export async function getSystemWalletOverview() {
  const response = await apiClient.get(PAYMENT_ENDPOINTS.SYSTEM_WALLET_OVERVIEW, {
    includeAuth: true,
  });

  return unwrapData(response);
}
