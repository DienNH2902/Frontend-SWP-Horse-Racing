import { apiClient } from "../client";

export async function createReplaySession(raceId) {
  const response = await apiClient.post(
    `/race-broadcast/${raceId}/replay`,
    {},
    { includeAuth: true },
  );
  return response.data;
}
