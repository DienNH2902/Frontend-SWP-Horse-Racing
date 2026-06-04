import { apiClient } from "../client";
import { USER_ENDPOINTS } from "../endpoints/user.endpoint";

export async function createUser(payload) {
  const response = await apiClient.post(USER_ENDPOINTS.ROOT, payload);
  return response.data;
}

export async function getUsers() {
  const response = await apiClient.get(USER_ENDPOINTS.ROOT, {
    includeAuth: true,
  });

  return response.data;
}

export async function getUsersByRole(role) {
  const response = await apiClient.get(USER_ENDPOINTS.ROLE(role), {
    includeAuth: true,
  });

  return response.data;
}

export async function getUserById(id) {
  const response = await apiClient.get(USER_ENDPOINTS.DETAIL(id), {
    includeAuth: true,
  });

  return response.data;
}

export async function deleteUser(id) {
  const response = await apiClient.delete(USER_ENDPOINTS.DETAIL(id), {
    includeAuth: true,
  });

  return response.data;
}

export async function updateSpectator(id, payload) {
  const response = await apiClient.put(
    USER_ENDPOINTS.UPDATE_SPECTATOR(id),
    payload,
    {
      includeAuth: true,
    },
  );

  return response.data;
}

export async function updateJockey(id, payload) {
  const response = await apiClient.put(
    USER_ENDPOINTS.UPDATE_JOCKEY(id),
    payload,
    {
      includeAuth: true,
    },
  );

  return response.data;
}

export async function updateHorseOwner(id, payload) {
  const response = await apiClient.put(
    USER_ENDPOINTS.UPDATE_HORSE_OWNER(id),
    payload,
    {
      includeAuth: true,
    },
  );

  return response.data;
}

export async function updateReferee(id, payload) {
  const response = await apiClient.put(
    USER_ENDPOINTS.UPDATE_REFEREE(id),
    payload,
    {
      includeAuth: true,
    },
  );

  return response.data;
}
