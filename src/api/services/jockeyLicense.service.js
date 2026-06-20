import { apiClient } from "../client";
import { JOCKEY_LICENSE_ENDPOINTS } from "../endpoints/jockeyLicense.endpoint";

export async function updateJockeyStatus(profileId, jockeyStatus) {
  const response = await apiClient.patch(
    JOCKEY_LICENSE_ENDPOINTS.UPDATE_JOCKEY_STATUS(profileId),
    { jockeyStatus },
    { includeAuth: true },
  );
  return response.data;
}
