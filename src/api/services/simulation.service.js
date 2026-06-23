import { apiClient } from "../client";

export const runSimulation =
    async (raceId) => {
        const response =
            await apiClient.post(
                `/race-simulation/${raceId}/run`,
                {},
                {
                    includeAuth: true,
                }
            );

        return response.data;
    };

export const getSimulationResult =
    async (raceId) => {
        const response =
            await apiClient.get(
                `/race-simulation/${raceId}/result`,
                {
                    includeAuth: true,
                }
            );

        return response.data;
    };
