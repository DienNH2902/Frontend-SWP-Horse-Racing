import { apiClient } from "../client";

const RACE_COURSE_ROOT = "/race-courses";

function unwrapData(response) {
    const data = response?.data;

    return (
        data?.data ||
        data?.result ||
        data
    );
}

export const getRaceCourses = async () => {
    const response = await apiClient.get(RACE_COURSE_ROOT, {
        includeAuth: true,
    });

    return unwrapData(response);
};

export const getRaceCourseById = async (id) => {
    const response = await apiClient.get(
        `${RACE_COURSE_ROOT}/${id}`,
        {
            includeAuth: true,
        }
    );

    return unwrapData(response);
};

export const createRaceCourse = async (payload) => {
    const response = await apiClient.post(RACE_COURSE_ROOT, payload, {
        includeAuth: true,
    });

    return unwrapData(response);
};

export const updateRaceCourse = async (id, payload) => {
    const response = await apiClient.put(`${RACE_COURSE_ROOT}/${id}`, payload, {
        includeAuth: true,
    });

    return unwrapData(response);
};

export const deleteRaceCourse = async (id) => {
    const response = await apiClient.delete(`${RACE_COURSE_ROOT}/${id}`, {
        includeAuth: true,
    });

    return unwrapData(response);
};
