export const JOCKEY_LICENSE_ENDPOINTS = {
  ROOT: "/jockey-licenses",
  ME: "/jockey-licenses/me",
  DETAIL: (id) => `/jockey-licenses/${id}`,
  UPLOAD_LICENSE: "/upload/jockey-license",
  UPDATE_JOCKEY_STATUS: (profileId) =>
    `/jockey-licenses/admin/update-status/${profileId}`,
};
