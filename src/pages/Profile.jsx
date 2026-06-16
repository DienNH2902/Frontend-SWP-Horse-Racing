import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
  DatePicker,
  InputNumber,
  Upload,
  Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import { getProfile } from "../api/services/auth.service";
import {
  changePassword,
  updateUserAccount,
  uploadAvatar,
} from "../api/services/user.service";
import { clearAuthSession, getAuthSession } from "../utils/storage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Hỗ trợ parse định dạng chuỗi VN

dayjs.extend(customParseFormat);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_IMAGE_URL = API_BASE_URL;

const { Text, Title } = Typography;

function formatValue(value) {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  return value;
}

function getInitials(name) {
  if (!name) {
    return "GH";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProfileId(profile) {
  return profile?._id || profile?.id || profile?.userId;
}

function getResponseProfile(response, fallback) {
  return (
    response?.data ||
    response?.result ||
    response?.user ||
    response?.profile ||
    fallback
  );
}

function Profile() {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    let isMounted = true;

    getProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          const rawDob = data?.dateOfBirth || data?.dob || "";
          const parsedDob = rawDob ? dayjs(rawDob, "DD/MM/YYYY") : null;

          form.setFieldsValue({
            avatar: data?.avatar || data?.avatarUrl || "",
            fullName: data?.fullName || data?.name || "",
            email: data?.email || "",
            phoneNumber: data?.phoneNumber || "",
            address: data?.address || "",
            dateOfBirth: parsedDob && parsedDob.isValid() ? parsedDob : null,
            gender: data?.gender,
            // Đổ dữ liệu các trường đặc thù của từng Role
            //Jockey
            weight: data?.weight,
            height: data?.height,
            jockeyStatus: data?.jockeyStatus,
            winRate: data?.winRate,
            reputationPoints: data?.reputationPoints,
            //owner
            totalHorsesOwned: data?.totalHorsesOwned,
            stableName: data?.stableName,
            stableAddress: data?.stableAddress,
            //referee
            experienceYears: data?.experienceYears,
            certification: data?.certification,
            racesAttempt: data?.racesAttempt,
            //spectator
            totalBets: data?.totalBets,
            totalPoints: data?.totalPoints,
            totalBalance: data?.totalBalance,
          });
        }
      })
      .catch(() => {
        message.error("Unable to load profile");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [form]);

  if (!authSession) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/home", { replace: true });
  }

  // --- Xử lý tải ảnh lên hệ thống ---
  async function handleCustomUpload({ file, onSuccess, onError }) {
    if (file.size > 5 * 1024 * 1024) {
      message.error("Image must be smaller than 5MB");
      onError(new Error("File too large"));
      return;
    }

    setIsUploading(true);
    try {
      const resData = await uploadAvatar(file);
      // Giả định backend trả về đường dẫn ảnh dạng: resData.imageUrl hoặc chính resData là chuỗi URL
      const path = resData?.imageUrl || resData?.url || resData;

      if (!path) {
        throw new Error("Invalid response from server");
      }

      // Cập nhật giá trị vào trường ẩn/hiện của Form
      form.setFieldsValue({ avatar: path });

      // Đồng bộ trực tiếp lên giao diện để thay đổi Avatar ngay lập tức
      setProfile((prev) => (prev ? { ...prev, avatar: path } : null));

      message.success("Avatar uploaded successfully");
      onSuccess(resData);
    } catch (err) {
      message.error(err?.message || "Failed to upload avatar");
      onError(err);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSave(values) {
    const profileId = getProfileId(profile);

    if (!profileId) {
      message.error("Unable to update profile because user id is missing");
      return;
    }

    setIsSaving(true);

    try {
      const { role, email, ...payload } = values;

      if (payload.dateOfBirth) {
        payload.dateOfBirth = dayjs(payload.dateOfBirth).format("DD/MM/YYYY");
      }

      const response = await updateUserAccount(
        profileId,
        profile.role,
        payload,
      );
      const updatedProfile = getResponseProfile(response, {
        ...profile,
        ...payload,
      });

      setProfile((currentProfile) => ({
        ...currentProfile,
        ...updatedProfile,
      }));
      message.success("Profile updated");
    } catch (error) {
      message.error(error?.message || "Unable to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  const fullName = formatValue(profile?.fullName || profile?.name);
  const avatar = profile?.avatar || profile?.avatarUrl;

  const displayAvatarUrl = avatar
    ? avatar.startsWith("http")
      ? avatar
      : `${BASE_IMAGE_URL}${avatar.replace(/^\//, "")}`
    : undefined;

  // Chuẩn hóa chuỗi Role để kiểm tra giao diện (bất kể viết hoa viết thường)
  const userRole = profile?.role?.toUpperCase() || "";

  // Hàm xử lý gửi dữ liệu đổi mật
  async function handleChangePasswordSubmit(values) {
    setIsChangingPassword(true);
    try {
      await changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Password changed successfully");
      setIsPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (err) {
      message.error(err?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <main className="profile-page">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0d2321;
          background: #f7fffd;
        }

        .profile-page {
          min-height: 100dvh;
          padding: 34px;
          background:
            linear-gradient(180deg, rgba(237, 255, 251, 0.96), rgba(255, 255, 255, 0.98)),
            url("/goldenhoof-hero.png") center / cover fixed;
        }

        .profile-shell {
          width: min(980px, 100%);
          margin: 0 auto;
        }

        .profile-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }

        .profile-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #06332e;
          font-size: 24px;
          font-weight: 950;
          text-decoration: none;
        }

        .profile-brand-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          color: #06332e;
          background: #69f8dd;
          font-weight: 950;
        }

        .profile-card.ant-card {
          border: 1px solid #ccefe7;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 22px 70px rgba(13, 70, 63, 0.1);
        }

        .profile-card .ant-card-body {
          padding: 0;
        }

        .profile-hero {
          min-height: 190px;
          display: flex;
          align-items: flex-end;
          padding: 28px;
          background:
            linear-gradient(90deg, rgba(0, 54, 48, 0.92), rgba(0, 132, 116, 0.72)),
            url("/goldenhoof-hero.png") center / cover;
        }

        .profile-identity {
          display: flex;
          align-items: center;
          gap: 22px;
          color: #fff;
        }

        .profile-avatar.ant-avatar {
          flex: 0 0 auto;
          border: 4px solid rgba(255, 255, 255, 0.86);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
        }

        .profile-identity h1.ant-typography {
          margin: 0 0 8px;
          color: #fff;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          letter-spacing: 0;
        }

        .profile-role.ant-tag {
          margin: 0;
          border-color: rgba(105, 248, 221, 0.38);
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        .profile-content {
          padding: 28px;
          background: #fff;
        }

        .profile-section-title.ant-typography {
          margin: 0 0 18px;
          color: #06332e;
          font-weight: 950;
          letter-spacing: 0;
        }

        .profile-descriptions.ant-descriptions .ant-descriptions-item-label {
          width: 180px;
          color: #52726e;
          font-weight: 850;
          background: #f3fffc;
        }

        .profile-descriptions.ant-descriptions .ant-descriptions-item-content {
          color: #0d2321;
          font-weight: 800;
        }

        .profile-form {
          display: grid;
          gap: 18px;
        }

        .profile-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px 18px;
        }

        .profile-form .ant-form-item {
          margin-bottom: 0;
        }

        .profile-form .ant-form-item-label > label {
          color: #52726e;
          font-weight: 850;
        }

        .profile-form .ant-input,
        .profile-form .ant-select-selector {
          border-color: #bdeee5 !important;
          border-radius: 8px;
          color: #0d2321;
          font-weight: 750;
          background: #fafffe;
        }

        .profile-readonly {
          margin-top: 26px;
        }

        .profile-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .profile-primary.ant-btn {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        .profile-primary.ant-btn:hover {
          border-color: transparent !important;
          color: #06332e !important;
          background: #75ffe6 !important;
        }

        .profile-secondary.ant-btn {
          border-color: #bdeee5;
          color: #006755;
          background: #fff;
          font-weight: 900;
        }

        .profile-secondary.ant-btn:hover {
          border-color: #69f8dd !important;
          color: #006755 !important;
        }

        /* Nút Upload nằm dưới Avatar */
        .avatar-upload-overlay {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        /* Tùy chỉnh nút Upload cho đồng bộ với thiết kế GoldenHoof */
        .avatar-upload-overlay .ant-btn {
          border-color: #bdeee5 !important;
          color: #006755 !important;
          background: #ffffff !important;
          font-weight: 800;
          border-radius: 6px;
          padding: 4px 14px;
          height: auto;
          box-shadow: 0 2px 8px rgba(13, 70, 63, 0.05);
          transition: all 0.2s ease;
        }

        /* Hiệu ứng khi hover vào nút Upload */
        .avatar-upload-overlay .ant-btn:hover {
          border-color: #69f8dd !important;
          background: #f3fffc !important;
          color: #06332e !important;
          box-shadow: 0 4px 12px rgba(13, 70, 63, 0.1);
        }

        @media (max-width: 640px) {
          .profile-page { padding: 18px; }
          .profile-topbar {
            align-items: flex-start;
            flex-direction: column;
          }
          .profile-hero { padding: 22px; }
          .profile-identity {
            align-items: flex-start;
            flex-direction: column;
          }
          .profile-content { padding: 22px; }
          .profile-form-grid {
            grid-template-columns: 1fr;
          }
          .profile-descriptions.ant-descriptions .ant-descriptions-item-label {
            width: auto;
          }
        }
      `}</style>

      <section className="profile-shell">
        <div className="profile-topbar">
          <Link className="profile-brand" to="/home">
            <span className="profile-brand-mark">GH</span>
            <span>GoldenHoof</span>
          </Link>
          <Space>
            <Button
              className="profile-secondary"
              onClick={() => navigate("/home")}
            >
              Home
            </Button>
            <Button className="profile-primary" onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </div>

        <Card className="profile-card">
          {/* Form luôn luôn được render cố định để `useForm` bám vào DOM */}
          <Form
            className="profile-form"
            form={form}
            layout="vertical"
            onFinish={handleSave}
            requiredMark={false}
          >
            {isLoading ? (
              <div style={{ padding: 28 }}>
                <Skeleton active avatar paragraph={{ rows: 6 }} />
              </div>
            ) : !profile ? (
              <div style={{ padding: 28 }}>No profile data found.</div>
            ) : (
              <>
                <div className="profile-hero">
                  <div className="profile-identity">
                    <Space orientation="vertical" align="center" size="middle">
                      {/* Bọc Avatar trong Upload component để hỗ trợ click-to-upload */}
                      <Upload
                        name="file"
                        accept="image/*"
                        showUploadList={false}
                        customRequest={handleCustomUpload}
                        disabled={isUploading}
                      >
                        <div
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          <Avatar
                            className="profile-avatar"
                            size={112}
                            src={displayAvatarUrl}
                          >
                            {getInitials(profile.fullName || profile.name)}
                          </Avatar>
                          <div className="avatar-upload-overlay">
                            <Button
                              size="small"
                              loading={isUploading}
                              icon={<UploadOutlined />}
                              style={{ marginTop: 8 }}
                            >
                              Upload
                            </Button>
                          </div>
                        </div>
                      </Upload>
                    </Space>
                    <div>
                      <Title level={1}>{fullName}</Title>
                      <Tag className="profile-role">
                        {formatValue(profile.role)}
                      </Tag>
                    </div>
                  </div>
                </div>

                <div className="profile-content">
                  <Title className="profile-section-title" level={3}>
                    Profile
                  </Title>

                  <div className="profile-form-grid">
                    <Form.Item
                      label="Full Name"
                      name="fullName"
                      rules={[
                        { required: true, message: "Full name is required" },
                      ]}
                    >
                      <Input placeholder="Nguyen Van A" />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Email is required" },
                        { type: "email", message: "Email is invalid" },
                      ]}
                    >
                      <Input placeholder="user@example.com" disabled />
                    </Form.Item>

                    <Form.Item label="Phone Number" name="phoneNumber">
                      <Input placeholder="0793829964" />
                    </Form.Item>

                    <Form.Item label="Date of Birth" name="dateOfBirth">
                      <DatePicker
                        placeholder="Select date"
                        format="DD/MM/YYYY"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item label="Gender" name="gender">
                      <Select
                        placeholder="Select gender"
                        options={[
                          { label: "Female", value: 0 },
                          { label: "Male", value: 1 },
                          { label: "Other", value: 2 },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item label="Avatar Path" name="avatar">
                      <Input
                        placeholder="uploads/avatar/filename.jpg"
                        disabled
                      />
                    </Form.Item>

                    {/* --- THỰC THỂ KHÁC NHAU SHOW FIELD KHÁC NHAU --- */}

                    {userRole === "JOCKEY" && (
                      <>
                        <Form.Item
                          label="Weight (kg)"
                          name="weight"
                          rules={[
                            { required: true, message: "Weight is required" },
                          ]}
                        >
                          <InputNumber
                            min={30}
                            max={200}
                            style={{ width: "100%" }}
                            placeholder="54"
                          />
                        </Form.Item>
                        <Form.Item
                          label="Height (cm)"
                          name="height"
                          rules={[
                            { required: true, message: "Height is required" },
                          ]}
                        >
                          <InputNumber
                            min={100}
                            max={250}
                            style={{ width: "100%" }}
                            placeholder="163"
                          />
                        </Form.Item>
                      </>
                    )}

                    {/* {userRole === "REFEREE" && (
                      <>
                        <Form.Item
                          label="Experience Years"
                          name="experienceYears"
                          rules={[
                            {
                              required: true,
                              message: "Experience years is required",
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            max={50}
                            style={{ width: "100%" }}
                            placeholder="4"
                          />
                        </Form.Item>
                        <Form.Item
                          label="Certification"
                          name="certification"
                          rules={[
                            {
                              required: true,
                              message: "Certification is required",
                            },
                          ]}
                        >
                          <Input placeholder="International Referee Level 1" />
                        </Form.Item>
                      </>
                    )} */}

                    {(userRole === "OWNER" || userRole === "HORSE OWNER") && (
                      <>
                        <Form.Item
                          label="Stable Name"
                          name="stableName"
                          rules={[
                            {
                              required: true,
                              message: "Stable name is required",
                            },
                          ]}
                        >
                          <Input placeholder="Golden Horse Stable" />
                        </Form.Item>
                        <Form.Item
                          label="Stable Address"
                          name="stableAddress"
                          rules={[
                            {
                              required: true,
                              message: "Stable address is required",
                            },
                          ]}
                        >
                          <Input placeholder="District 9, Ho Chi Minh City" />
                        </Form.Item>
                      </>
                    )}
                  </div>

                  <Form.Item label="Address" name="address">
                    <Input.TextArea
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      placeholder="123 Duong so 123"
                    />
                  </Form.Item>

                  <div className="profile-actions">
                    <Button
                      className="profile-primary"
                      htmlType="submit"
                      loading={isSaving}
                    >
                      Save Profile
                    </Button>
                    <Button
                      className="profile-secondary"
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                    >
                      Change Password
                    </Button>
                  </div>

                  <Descriptions
                    bordered
                    className="profile-descriptions profile-readonly"
                    column={1}
                    size="middle"
                  >
                    <Descriptions.Item label="Role">
                      <Tag className="profile-role">
                        {formatValue(profile.role)}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Text strong>{formatValue(profile.status)}</Text>
                    </Descriptions.Item>
                    {userRole === "JOCKEY" && (
                      <Descriptions.Item label="Jockey Status">
                        <Text strong>{formatValue(profile.jockeyStatus)}</Text>
                      </Descriptions.Item>
                    )}
                    {userRole === "REFEREE" && (
                      <>
                        <Descriptions.Item label="Certification">
                          <Text strong>
                            {formatValue(profile.certification)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Experience Years">
                          <Text strong>
                            {formatValue(profile.experienceYears)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Races Attempt">
                          <Text strong>
                            {formatValue(profile.racesAttempt)}
                          </Text>
                        </Descriptions.Item>
                      </>
                    )}
                    {userRole === "OWNER" ||
                      (userRole === "HORSE OWNER" && (
                        <Descriptions.Item label="Total Horse Owned">
                          <Text strong>
                            {formatValue(profile.totalHorsesOwned)}
                          </Text>
                        </Descriptions.Item>
                      ))}

                    {userRole === "SPECTATOR" && (
                      <>
                        <Descriptions.Item label="Points Balance">
                          <Text strong>
                            {formatValue(profile.pointBalance)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Bets">
                          <Text strong>{formatValue(profile.totalBets)}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Points">
                          <Text strong>{formatValue(profile.totalPoints)}</Text>
                        </Descriptions.Item>
                      </>
                    )}
                    {(userRole === "SPECTATOR" || userRole === "JOCKEY") && (
                      <Descriptions.Item label="Win Rate">
                        <Text strong>{formatValue(profile.winRate)}</Text>
                      </Descriptions.Item>
                    )}
                    {(userRole === "OWNER" ||
                      userRole === "HORSE OWNER" ||
                      userRole === "JOCKEY" ||
                      userRole === "REFEREE") && (
                      <Descriptions.Item label="Reputation Points">
                        <Text strong>
                          {formatValue(profile.reputationPoints)}
                        </Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </div>
              </>
            )}
          </Form>
        </Card>
      </section>

      {/* Modal thay đổi mật khẩu */}
      <Modal
        title="Change Password"
        open={isPasswordModalOpen}
        onCancel={() => {
          if (!isChangingPassword) {
            setIsPasswordModalOpen(false);
            passwordForm.resetFields();
          }
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePasswordSubmit}
          requiredMark={false}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Current Password"
            name="oldPassword"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter your new password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match"),
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                className="profile-secondary"
                disabled={isChangingPassword}
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  passwordForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                className="profile-primary"
                htmlType="submit"
                loading={isChangingPassword}
              >
                Update Password
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}

export default Profile;
