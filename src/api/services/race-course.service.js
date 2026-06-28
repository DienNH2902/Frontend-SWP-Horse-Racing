import { apiClient } from "../client";

export const getRaceCourses = async () => {
    const response = await apiClient.get("/race-courses");
    return response.data;
};

export const getRaceCourseById = async (id) => {
    const response = await apiClient.get(
        `/race-courses/${id}`
    );

    return response.data;
};
