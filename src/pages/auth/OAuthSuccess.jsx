// src/pages/auth/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveAuthSession } from "../../utils/storage";
import { getRoleHomePath } from "../../utils/roles";
import { jwtDecode } from "jwt-decode";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        // 1. Sử dụng thư viện jwtDecode để bóc tách payload từ chuỗi token
        const decodedPayload = jwtDecode(token);

        if (!decodedPayload) {
          throw new Error("Token không hợp lệ hoặc không thể giải mã");
        }

        // 2. Tái cấu trúc lại thành Object Session chuẩn giống hệt Form Login
        const session = {
          access_token: token, // Cả 2 định dạng tránh Axios interceptor đọc sai key
          accessToken: token,
          user: {
            id: decodedPayload.sub,
            fullName: decodedPayload.fullName,
            email: decodedPayload.email,
            role: decodedPayload.role,
            status: decodedPayload.status,
            avatar: decodedPayload.avatar,
            address: decodedPayload.address,
            gender: decodedPayload.gender,
            dateOfBirth: decodedPayload.dateOfBirth,
            phoneNumber: decodedPayload.phoneNumber,
          },
        };

        // 3. Lưu dữ liệu phiên làm việc vào Storage
        saveAuthSession(session, true);

        // 4. Điều hướng thẳng về trang Workspace của hệ thống dựa theo Role
        const targetPath = getRoleHomePath(session.user.role);
        navigate(targetPath, { replace: true });
      } catch (error) {
        console.error("Lỗi giải mã token bằng thư viện jwt-decode:", error);
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      Đang hoàn tất đăng nhập bằng Google...
    </div>
  );
}
