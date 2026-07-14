import { apiClient } from "../client";
import { JOCKEY_LICENSE_ENDPOINTS } from "../endpoints/jockeyLicense.endpoint";

function unwrapData(response) {
  const data = response?.data;

  return data?.data || data?.result || data?.license || data;
}

function unwrapCollection(response) {
  const data = unwrapData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.licenses)) return data.licenses;
  if (Array.isArray(data?.jockeyLicenses)) return data.jockeyLicenses;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.records)) return data.records;

  return [];
}

export async function getMyJockeyLicenses() {
  const response = await apiClient.get(JOCKEY_LICENSE_ENDPOINTS.ME, {
    includeAuth: true,
  });

  return unwrapCollection(response);
}

export async function createJockeyLicense(payload) {
  const response = await apiClient.post(
    JOCKEY_LICENSE_ENDPOINTS.ROOT,
    payload,
    {
      includeAuth: true,
    },
  );

  return unwrapData(response);
}

export async function updateJockeyLicense(id, payload) {
  const response = await apiClient.patch(
    JOCKEY_LICENSE_ENDPOINTS.DETAIL(id),
    payload,
    {
      includeAuth: true,
    },
  );

  return unwrapData(response);
}

export async function uploadJockeyLicenseFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    JOCKEY_LICENSE_ENDPOINTS.UPLOAD_LICENSE,
    formData,
    {
      includeAuth: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return unwrapData(response);
}

export async function updateJockeyStatus(profileId, jockeyStatus) {
  const response = await apiClient.patch(
    JOCKEY_LICENSE_ENDPOINTS.UPDATE_JOCKEY_STATUS(profileId),
    { jockeyStatus },
    { includeAuth: true },
  );
  return response.data;
}

export async function deleteJockeyLicense(id) {
  const response = await apiClient.delete(
    JOCKEY_LICENSE_ENDPOINTS.DETAIL(id),
    {
      includeAuth: true,
    },
  );

  return unwrapData(response);
}