import { apiClient } from "../client";
import { PRIZE_DISTRIBUTION_ENDPOINTS } from "../endpoints/prize-distribution.endpoint";

export async function distributeRacePrize(raceId) {
  const response = await apiClient.post(
    PRIZE_DISTRIBUTION_ENDPOINTS.DISTRIBUTE(raceId),
    {},
    { includeAuth: true },
  );

  return response.data;
}
