import { apiClient } from "../client";
import { MONEY_TRANSACTION_ENDPOINTS } from "../endpoints/moneyTransaction.endpoint";

function unwrapData(response) {
  const data = response?.data;
  return data?.data || data?.result || data || [];
}

export async function getMyMoneyHistory() {
  const response = await apiClient.get(
    MONEY_TRANSACTION_ENDPOINTS.MY_TRANSACTIONS,
    {
      includeAuth: true,
    },
  );
  return unwrapData(response);
}
