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

export async function updateUser(id, payload) {
  const response = await apiClient.put(USER_ENDPOINTS.DETAIL(id), payload, {
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

export async function updateUserAccount(id, role, payload) {
  let endpoint;

  // Chuẩn hóa chuỗi role về dạng viết thường để kiểm tra chuẩn xác
  const userRole = role?.toLowerCase();

  switch (userRole) {
    case "spectator":
      endpoint = USER_ENDPOINTS.UPDATE_SPECTATOR(id);
      break;
    case "jockey":
      endpoint = USER_ENDPOINTS.UPDATE_JOCKEY(id);
      break;
    case "referee":
      endpoint = USER_ENDPOINTS.UPDATE_REFEREE(id);
      break;
    case "horseowner":
    case "horse owner":
    case "horse-owner":
    case "horse_owner":
      endpoint = USER_ENDPOINTS.UPDATE_HORSE_OWNER(id);
      break;
    default:
      // Trường hợp không khớp role đặc thù nào, fallback về route cơ bản (nếu sau này có dùng)
      endpoint = USER_ENDPOINTS.DETAIL(id);
  }

  const response = await apiClient.put(endpoint, payload, {
    includeAuth: true,
  });

  return response.data;
}
