import { apiClient } from "../client";

export const getRaceCondition =
    async (raceId) => {
        const response =
            await apiClient.get(
                `/race-conditions/${raceId}`,
                {
                    includeAuth: true,
                }
            );

        return response.data;
    };

export const createRaceCondition =
    async (payload) => {
        const response =
            await apiClient.post(
                "/race-conditions",
                payload,
                {
                    includeAuth: true,
                }
            );

        return response.data;
    };

export const updateRaceCondition =
    async (raceId, payload) => {
        const response =
            await apiClient.patch(
                `/race-conditions/${raceId}`,
                payload,
                {
                    includeAuth: true,
                }
            );

        return response.data;
    };
