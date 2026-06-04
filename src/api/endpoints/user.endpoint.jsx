export const USER_ENDPOINTS = {
  ROOT: "/users",
  ROLE: (role) => `/users/role?role=${role}`,
  DETAIL: (id) => `/users/${id}`,
  UPDATE_SPECTATOR: (id) => `/users/spectator/${id}`,
  UPDATE_JOCKEY: (id) => `/users/jockey/${id}`,
  UPDATE_HORSE_OWNER: (id) => `/users/horse-owner/${id}`,
  UPDATE_REFEREE: (id) => `/users/referee/${id}`,
};
