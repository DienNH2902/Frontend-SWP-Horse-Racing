import { apiClient } from "../client";
import { PRIZE_ENDPOINTS } from "../endpoints/prize.endpoint";

export async function createPrize(payload) {
  const response = await apiClient.post(PRIZE_ENDPOINTS.ROOT, payload, {
    includeAuth: true,
  });

  return response.data;
}

export async function getPrizesByTournament(tournamentId) {
  const response = await apiClient.get(
    PRIZE_ENDPOINTS.BY_TOURNAMENT(tournamentId),
    { includeAuth: true },
  );

  return response.data;
}
