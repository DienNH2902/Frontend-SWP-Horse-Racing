import { apiClient } from "../client";
import { JOCKEY_INVITATION_ENDPOINTS } from "../endpoints/jockeyInvitation.endpoint";

function unwrapData(response) {
  const data = response?.data;

  return data?.data || data?.result || data?.contract || data;
}

export async function cancelContract(payload) {
  const response = await apiClient.post(
    JOCKEY_INVITATION_ENDPOINTS.REPORT_BREACH,
    payload,
    { includeAuth: true },
  );

  return unwrapData(response);
}
