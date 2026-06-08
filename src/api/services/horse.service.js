import { apiClient } from "../client";
import { HORSE_ENDPOINTS } from "../endpoints/horse.endpoint";

export async function createHorse(payload) {
  const response = await apiClient.post(HORSE_ENDPOINTS.ROOT, payload, {
    includeAuth: true,
  });

  return response.data;
}

export async function getHorses() {
  const response = await apiClient.get(HORSE_ENDPOINTS.ROOT, {
    includeAuth: true,
  });

  return response.data;
}

export async function getMyHorses() {
  const response = await apiClient.get(HORSE_ENDPOINTS.MY_HORSES, {
    includeAuth: true,
  });

  return response.data;
}

export async function getHorseById(id) {
  const response = await apiClient.get(HORSE_ENDPOINTS.DETAIL(id), {
    includeAuth: true,
  });

  return response.data;
}

export async function updateHorse(id, payload) {
  const response = await apiClient.put(HORSE_ENDPOINTS.DETAIL(id), payload, {
    includeAuth: true,
  });

  return response.data;
}

export async function deleteHorse(id) {
  const response = await apiClient.delete(HORSE_ENDPOINTS.DETAIL(id), {
    includeAuth: true,
  });

  return response.data;
}
