export const WITHDRAWAL_ENDPOINTS = {
  ROOT: "/payment/withdrawal/request",
  MY_REQUESTS: "/payment/withdrawal/my-request",
  ADMIN_ALL: "/payment/withdrawal/admin/all",
  DETAIL: (id) => `/payment/withdrawal/${id}`,
  APPROVE: (id) => `/payment/withdrawal/admin/${id}/approve`,
  REJECT: (id) => `/payment/withdrawal/admin/${id}/reject`,
};
