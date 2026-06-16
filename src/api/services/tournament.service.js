import { apiClient } from "../client";
import { TOURNAMENT_ENDPOINTS } from "../endpoints/tournament.endpoint";

export async function getTournaments() {
    const response = await apiClient.get(
        TOURNAMENT_ENDPOINTS.ROOT,
        {
            includeAuth: true,
        }
    );

    return response.data;
}

export async function getTournamentById(id) {
    const response = await apiClient.get(
        TOURNAMENT_ENDPOINTS.DETAIL(id),
        {
            includeAuth: true,
        }
    );

    return response.data;
}

export async function createTournament(payload) {
    const response = await apiClient.post(
        TOURNAMENT_ENDPOINTS.ROOT,
        payload,
        {
            includeAuth: true,
        }
    );

    return response.data;
}

export async function updateTournament(id, payload) {
    const response = await apiClient.patch(
        TOURNAMENT_ENDPOINTS.DETAIL(id),
        payload,
        {
            includeAuth: true,
        }
    );

    return response.data;
}

export async function deleteTournament(id) {
    const response = await apiClient.delete(
        TOURNAMENT_ENDPOINTS.DETAIL(id),
        {
            includeAuth: true,
        }
    );

    return response.data;
}

export async function updateTournamentStatus(id, status) {
    const response = await apiClient.patch(
        TOURNAMENT_ENDPOINTS.STATUS(id),
        {
            status,
        },
        {
            includeAuth: true,
        }
    );

    return response.data;
}