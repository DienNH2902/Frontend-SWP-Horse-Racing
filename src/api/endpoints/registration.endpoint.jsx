export const REGISTRATION_ENDPOINTS = {
  CREATE: "/registrations",
  ROOT: "/admin/registrations",
  DETAIL: (id) => `/admin/registrations/${id}`,
  CONFIRM: (id) => `/admin/registrations/${id}/confirm`,
  REJECT: (id) => `/admin/registrations/${id}/reject`,
  ACCEPT_TO_WAITLIST: (id) => `/admin/registrations/${id}/accept-to-waitlist`,
};
