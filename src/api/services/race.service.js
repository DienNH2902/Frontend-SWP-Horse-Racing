import { apiClient } from "../client";
import { RACE_ENDPOINTS } from "../endpoints/race.endpoint";

export const getMyRaces = async () => {
    const response = await apiClient.get(RACE_ENDPOINTS.MY_RACES, {
        includeAuth: true,
    });

    return response.data;
};

export const getRacesByTournament = async (tournamentId, status = "") => {
    const response = await apiClient.get(
        RACE_ENDPOINTS.BY_TOURNAMENT(tournamentId),
        {
            params: status ? { status } : {},
            includeAuth: true,
        }
    );

    return response.data;
};

export const getRaceById = async (raceId) => {
    const response = await apiClient.get(
        RACE_ENDPOINTS.DETAIL(raceId),
        {
            includeAuth: true,
        }
    );

    return response.data;
};

export const confirmRaceReady = async (raceId) => {
    const response = await apiClient.patch(
        RACE_ENDPOINTS.CONFIRM_READY(raceId),
        {},
        {
            includeAuth: true,
        }
    );

    return response.data;
};

export const createRaceBatch = async (payload) => {
    const response = await apiClient.post(
        RACE_ENDPOINTS.BATCH,
        payload,
        {
            includeAuth: true,
        }
    );

    return response.data;
};

export const createRound2Race = async (tournamentId, payload) => {
    const params = {
        startTime: payload.startTime,
        date: payload.date,
    };

    const response = await apiClient.post(
        RACE_ENDPOINTS.ROUND_2(tournamentId),
        {},
        {
            params,
            includeAuth: true,
        }
    );

    return response.data;
};

export const assignRaceReferee = async (raceId, refereeId) => {
    const response = await apiClient.patch(
        RACE_ENDPOINTS.ASSIGN_REFEREE(raceId),
        { refereeId },
        {
            includeAuth: true,
        }
    );

    return response.data;
};

export const assignRaceCourse = async (raceId, raceCourseId) => {
    const response = await apiClient.patch(
        RACE_ENDPOINTS.ASSIGN_RACE_COURSE(raceId),
        { raceCourseId },
        {
            includeAuth: true,
        }
    );

    return response.data;
};

export const bulkAssignRaceHorses = async (raceId, registrationIds) => {
    const response = await apiClient.post(
        RACE_ENDPOINTS.BULK_ASSIGN_HORSES(raceId),
        { registrationIds },
        {
            includeAuth: true,
        }
    );

    return response.data;
};
