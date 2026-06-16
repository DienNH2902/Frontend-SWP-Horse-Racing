import { apiClient } from "../client";

export const getRacesByTournament = async (tournamentId) => {
    const response = await apiClient.get(
        `/races/tournament/${tournamentId}`,
        {
            includeAuth: true,
        }
    );

    return response.data;
};

export const getRaceById = async (raceId) => {
    const response = await apiClient.get(
        `/races/${raceId}`,
        {
            includeAuth: true,
        }
    );

    return response.data;
};