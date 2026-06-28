import { apiClient } from "../client";

function unwrapData(response) {
    const data = response?.data;

    return (
        data?.data ||
        data?.result ||
        data
    );
}

export async function getRaceCourseById(id) {
    const response =
        await apiClient.get(
            `/race-courses/${id}`
        );

    return unwrapData(response);
}