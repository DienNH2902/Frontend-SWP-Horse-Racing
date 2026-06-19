export const TOURNAMENT_ENDPOINTS = {
  ROOT: "/tournaments",

  DETAIL: (id) => `/tournaments/${id}`,

  STATUS: (id) => `/tournaments/${id}/status`,
};