export const TOURNAMENT_ENDPOINTS = {
  ROOT: "/tournaments",
  DETAIL: (id) => `/tournaments/${id}`,
  UPDATE_STATUS: (id) => `/tournaments/${id}/status`,
};
