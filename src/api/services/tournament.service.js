import { apiClient } from "../client";
import { TOURNAMENT_ENDPOINTS } from "../endpoints/tournament.endpoint";

function unwrapData(response) {
    const data = response?.data;

    return data?.data || data?.result || data?.tournament || data;
}

function unwrapCollection(response) {
    const data = unwrapData(response);

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.tournaments)) return data.tournaments;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.records)) return data.records;

    return [];
}

export async function getTournaments(status) {
    const response = await apiClient.get(
        TOURNAMENT_ENDPOINTS.ROOT,
        {
            includeAuth: true,
            params: status ? { status } : undefined,
        }
    );

    return unwrapCollection(response).filter((tournament) => {
        const status = String(tournament?.status || "").toLowerCase();

        return status !== "canceled";
    });
}



export async function createTournament(payload) {
    const response = await apiClient.post(
        TOURNAMENT_ENDPOINTS.ROOT,
        payload,
        {
            includeAuth: true,
        }
    );

    return unwrapData(response);
}

export async function updateTournament(id, payload) {
    const response = await apiClient.patch(
        TOURNAMENT_ENDPOINTS.DETAIL(id),
        payload,
        {
            includeAuth: true,
        }
    );

    return unwrapData(response);
}

export async function deleteTournament(id) {
    const response = await apiClient.delete(
        TOURNAMENT_ENDPOINTS.DETAIL(id),
        {
            includeAuth: true,
        }
    );

    return unwrapData(response);
}

export async function updateTournamentStatus(id, status) {
    const response = await apiClient.patch(
        TOURNAMENT_ENDPOINTS.STATUS(id),
        { status },
        {
            includeAuth: true,
        }
    );

    return unwrapData(response);
}

export async function getTournamentById(id) {
  const response = await apiClient.get(TOURNAMENT_ENDPOINTS.DETAIL(id), {
    includeAuth: true,
  });

  return unwrapData(response);
}

export async function getTournamentAdvancements(id) {
  const response = await apiClient.get(
    TOURNAMENT_ENDPOINTS.ADVANCEMENTS(id),
    {
      includeAuth: true,
    }
  );

  return unwrapCollection(response);
}
