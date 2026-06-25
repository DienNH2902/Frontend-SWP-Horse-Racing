export const RACE_ENDPOINTS = {
  MY_RACES: "/races/my-races",
  BATCH: "/races/batch",
  BY_TOURNAMENT: (tournamentId) => `/races/tournament/${tournamentId}`,
  DETAIL: (raceId) => `/races/${raceId}`,
  ROUND_2: (tournamentId) => `/races/${tournamentId}/round2`,
  ASSIGN_REFEREE: (raceId) => `/races/${raceId}/assign-referee`,
  ASSIGN_RACE_COURSE: (raceId) => `/races/${raceId}/assign-race-course`,
  BULK_ASSIGN_HORSES: (raceId) => `/races/${raceId}/bulk-assign-horses`,
  CONFIRM_READY: (raceId) => `/races/${raceId}/confirm-ready`,
};
