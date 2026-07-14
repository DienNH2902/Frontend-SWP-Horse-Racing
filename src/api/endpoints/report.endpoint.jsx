export const REPORT_ENDPOINTS = {
  ROOT: "/reports",
  MY_REPORTS: "/reports/my-reports",
  ADMIN_ALL: "/reports/admin/all",
  ADMIN_STATS: "/reports/admin/stats",
  DETAIL: (id) => `/reports/${id}`,
  RESOLVE: (id) => `/reports/${id}/resolve`,
};
