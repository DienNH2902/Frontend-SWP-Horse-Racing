import { apiClient } from "../client";
import { NOTIFICATION_ENDPOINTS } from "../endpoints/notification.endpoint";

// Hàm bổ trợ unwrap để lấy đúng cấu trúc mảng hoặc Object trả về nếu cấu trúc API bọc qua nhiều lớp data
function unwrapData(response) {
  const data = response?.data;
  return data?.data || data?.result || data || [];
}

export async function getMyNotifications() {
  // Với GET: tham số thứ 2 là config object chứa params, headers, hoặc includeAuth
  const response = await apiClient.get(
    NOTIFICATION_ENDPOINTS.MY_NOTIFICATIONS,
    {
      includeAuth: true,
    },
  );
  return unwrapData(response);
}

export async function markNotificationAsRead(id) {
  // Với PATCH/POST/PUT: tham số thứ 2 là payload (body), tham số thứ 3 mới là config object
  const response = await apiClient.patch(
    NOTIFICATION_ENDPOINTS.READ_ONE(id),
    {}, // Không có body thì truyền object rỗng
    {
      includeAuth: true,
    },
  );
  return unwrapData(response);
}

export async function markAllNotificationsAsRead() {
  // Với PATCH/POST/PUT: tương tự như trên
  const response = await apiClient.patch(
    NOTIFICATION_ENDPOINTS.READ_ALL,
    {}, // Không có body thì truyền object rỗng
    {
      includeAuth: true,
    },
  );
  return unwrapData(response);
}
