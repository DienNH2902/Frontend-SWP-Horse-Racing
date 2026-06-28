export const JOCKEY_INVITATION_ENDPOINTS = {
  ROOT: "/jockey-invitations",
  SENT: "/jockey-invitations/sent",
  MY_INVITATIONS: "/jockey-invitations/my-invitations",
  DETAIL: (id) => `/jockey-invitations/${id}`,
  RESPOND: (id) => `/jockey-invitations/${id}/respond`,
  CONTRACT: (id) => `/jockey-invitations/${id}/contract`,
};
