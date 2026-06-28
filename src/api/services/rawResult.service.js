import { apiClient } from "../client";

function unwrapData(response) {
    const data = response?.data;
    return data?.data || data?.result || data;
}

export async function getRawResults(raceId) {
    const response = await apiClient.get(
        `/raw-results/${raceId}/raw`,
        {
            includeAuth: true,
        }
    );

    return unwrapData(response);
}

export async function getFinalResults(raceId) {
    const res = await apiClient.get(
        `/raw-results/${raceId}/final`,
        {
            includeAuth: true,
        }
    );

    return res.data;
}

export async function confirmRawResults(
    raceId,
    disqualifiedHorseIds
) {
    const res = await apiClient.patch(
        `/raw-results/${raceId}/confirm`,
        {
            disqualifiedHorseIds,
        },
        {
            includeAuth: true,
        }
    );

    return res.data;
}