import { apiClient } from "../client";
import { POINTS_TRANSACTION_ENDPOINTS } from "../endpoints/pointsTransaction.endpoint";

function unwrapCollection(response) {
  const data = response?.data?.data || response?.data?.result || response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;
  return [];
}

export async function getMyPointsHistory() {
  const response = await apiClient.get(
    POINTS_TRANSACTION_ENDPOINTS.MY_HISTORY,
    {
      includeAuth: true,
    },
  );
  return unwrapCollection(response);
}
