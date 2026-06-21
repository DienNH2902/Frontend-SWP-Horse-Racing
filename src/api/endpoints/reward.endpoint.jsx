export const REWARD_ENDPOINTS = {
  ROOT: "/rewards",
  DETAIL: (id) => `/rewards/${id}`,
  DASHBOARD: "/rewards/dashboard",
  MY_ASSETS: "/rewards/my-assets",
  CLAIM: (rewardId) => `/rewards/claim/${rewardId}`,
};
