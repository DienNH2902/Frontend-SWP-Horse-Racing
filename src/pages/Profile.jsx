import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Descriptions, Form, Input, Select, Skeleton, Space, Tag, Typography, message } from "antd";
import "antd/dist/reset.css";
import { getProfile } from "../api/services/auth.service";
import { updateUserAccount } from "../api/services/user.service";
import { clearAuthSession, getAuthSession } from "../utils/storage";

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
  return response?.data || response?.result || response?.user || response?.profile || fallback;
}

function Profile() {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const [form] = Form.useForm();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          form.setFieldsValue({
            avatar: data?.avatar || data?.avatarUrl || "",
            fullName: data?.fullName || data?.name || "",
            email: data?.email || "",
            phoneNumber: data?.phoneNumber || "",
            address: data?.address || "",
            dateOfBirth: data?.dateOfBirth || data?.dob || "",
            gender: data?.gender,
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
    navigate("/", { replace: true });
  }

  async function handleSave(values) {
    const profileId = getProfileId(profile);

    if (!profileId) {
      message.error("Unable to update profile because user id is missing");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        ...values,
        role: profile.role,
      };
      const response = await updateUserAccount(profileId, payload);
      const updatedProfile = getResponseProfile(response, { ...profile, ...payload });

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
  const avatarUrl = profile?.avatar || profile?.avatarUrl;

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
          <Link className="profile-brand" to="/">
            <span className="profile-brand-mark">GH</span>
            <span>GoldenHoof</span>
          </Link>
          <Space>
            <Button className="profile-secondary" onClick={() => navigate("/home")}>
              Home
            </Button>
            <Button className="profile-primary" onClick={handleLogout}>
              Logout
            </Button>
          </Space>
        </div>

        <Card className="profile-card">
          <Skeleton active avatar paragraph={{ rows: 4 }} loading={isLoading}>
            {profile ? (
              <>
                <div className="profile-hero">
                  <div className="profile-identity">
                    <Avatar
                      className="profile-avatar"
                      size={112}
                      src={avatarUrl}
                    >
                      {getInitials(profile.fullName || profile.name)}
                    </Avatar>
                    <div>
                      <Title level={1}>{fullName}</Title>
                      <Tag className="profile-role">{formatValue(profile.role)}</Tag>
                    </div>
                  </div>
                </div>

                <div className="profile-content">
                  <Title className="profile-section-title" level={3}>
                    Profile
                  </Title>
                  <Form
                    className="profile-form"
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    requiredMark={false}
                  >
                    <div className="profile-form-grid">
                      <Form.Item
                        label="Full Name"
                        name="fullName"
                        rules={[{ required: true, message: "Full name is required" }]}
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
                        <Input placeholder="user@example.com" />
                      </Form.Item>

                      <Form.Item label="Phone Number" name="phoneNumber">
                        <Input placeholder="0793829964" />
                      </Form.Item>

                      <Form.Item label="Date of Birth" name="dateOfBirth">
                        <Input placeholder="20/12/2003" />
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

                      <Form.Item label="Avatar URL" name="avatar">
                        <Input placeholder="https://ui-avatars.com/api/?name=Nguyen+Van+A" />
                      </Form.Item>
                    </div>

                    <Form.Item label="Address" name="address">
                      <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} placeholder="123 Duong so 123" />
                    </Form.Item>

                    <div className="profile-actions">
                      <Button className="profile-primary" htmlType="submit" loading={isSaving}>
                        Save Profile
                      </Button>
                      <Button className="profile-secondary" type="button">
                        Change Password
                      </Button>
                    </div>
                  </Form>

                  <Descriptions
                    bordered
                    className="profile-descriptions profile-readonly"
                    column={1}
                    size="middle"
                  >
                    <Descriptions.Item label="Role">
                      <Tag className="profile-role">{formatValue(profile.role)}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Text strong>{formatValue(profile.status)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Point Balance">
                      <Text strong>{formatValue(profile.pointBalance)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Points">
                      <Text strong>{formatValue(profile.totalPoints)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Bets">
                      <Text strong>{formatValue(profile.totalBets)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Win Rate">
                      <Text strong>{formatValue(profile.winRate)}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </>
            ) : null}
          </Skeleton>
        </Card>
      </section>
    </main>
  );
}

export default Profile;
