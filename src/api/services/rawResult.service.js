import { apiClient } from "../client";

export const getRawResults = async (raceId) => {
    const response = await apiClient.get(
        `/raw-results/${raceId}/raw`,
        {
            includeAuth: true,
        }
    );

    return response.data;
};

export const getFinalResults = async (raceId) => {
    const response = await apiClient.get(
        `/raw-results/${raceId}/final`,
        {
            includeAuth: true,
        }
    );

    return response.data;
};