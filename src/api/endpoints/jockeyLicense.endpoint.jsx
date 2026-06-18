export const JOCKEY_LICENSE_ENDPOINTS = {
  ROOT: "/jockey-licenses",
  DETAIL: (id) => `/jockey-licenses/${id}`,
  UPDATE_JOCKEY_STATUS: (profileId) =>
    `/jockey-licenses/admin/update-status/${profileId}`,
};
