import { apiClient } from "../client";

export const getRaceCourseById = async (id) => {
    const response = await apiClient.get(
        `/race-courses/${id}`
    );

    return response.data;
};