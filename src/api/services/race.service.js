import { apiClient } from "../client";

export const getMyRaces = async () => {
    const response = await apiClient.get(
        "/races/my-races",
        {
            includeAuth: true,
        }
    );

    console.log(
        "MY RACES RESPONSE:",
        response.data
    );

    return response.data;
};

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

export const confirmRaceReady = async (raceId) => {
    const response = await apiClient.patch(
        `/races/${raceId}/confirm-ready`,
        {},
        {
            includeAuth: true,
        }
    );

    return response.data;
};