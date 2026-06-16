import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import "antd/dist/reset.css";
import {
  deleteUser,
  getUsers,
  updateUserAccount,
} from "../../api/services/user.service";

const { Text, Title } = Typography;

function pick(source, keys, fallback = "") {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }
  return fallback;
}

function resolveList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.users)) return response.users;
  return [];
}

function formatDate(value) {
  if (!value) return "N/A";

  // Nếu định dạng trả về dạng DD/MM/YYYY (như Swagger mô tả) thay vì ISO string
  if (typeof value === "string" && value.includes("/")) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeUser(user, index) {
  const id = pick(user, ["id", "_id", "userId"], `user-${index}`);
  const status = pick(user, ["status", "accountStatus", "isActive"], "Active");
  const rawRole = pick(user, ["role", "roleName", "type"], "Spectator");

  // Chuẩn hóa tên role theo đúng định dạng chuỗi route của Swagger API
  let normalizedRole = "Spectator";
  const lowerRole = rawRole.toLowerCase();
  if (lowerRole.includes("jockey")) normalizedRole = "Jockey";
  else if (lowerRole.includes("referee")) normalizedRole = "Referee";
  else if (lowerRole.includes("owner") || lowerRole.includes("horse"))
    normalizedRole = "Horse-Owner";

  return {
    key: id,
    id,
    avatar: pick(user, ["avatar", "avatarUrl", "imageUrl", "photoUrl"], ""),
    email: pick(user, ["email", "mail"], "N/A"),
    fullName: pick(
      user,
      ["fullName", "name", "displayName", "username"],
      "Unnamed User",
    ),
    dateOfBirth: pick(user, ["dateOfBirth", "dob", "birthDate"], ""),
    phoneNumber: pick(user, ["phoneNumber", "phone", "mobile"], "N/A"),
    address: pick(user, ["address", "location"], "N/A"),
    gender:
      user?.gender !== undefined && user?.gender !== null
        ? Number(user.gender)
        : 1,
    role: normalizedRole,
    status:
      typeof status === "boolean" ? (status ? "Active" : "Disabled") : status,
    weight: user?.weight,
    height: user?.height,
    experienceYears: user?.experienceYears,
    certification: user?.certification,
    stableName: user?.stableName,
    stableAddress: user?.stableAddress,
  };
}

function roleColor(role) {
  const normalizedRole = String(role).toLowerCase();
  if (normalizedRole.includes("admin")) return "cyan";
  if (normalizedRole.includes("jockey")) return "gold";
  if (normalizedRole.includes("owner") || normalizedRole.includes("horse"))
    return "purple";
  if (normalizedRole.includes("referee")) return "blue";
  return "green";
}

function statusColor(status) {
  const normalizedStatus = String(status).toLowerCase();
  if (
    normalizedStatus.includes("disable") ||
    normalizedStatus.includes("delete") ||
    normalizedStatus === "false"
  ) {
    return "red";
  }
  if (normalizedStatus.includes("pending")) return "orange";
  return "green";
}

function UserManagement() {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const response = await getUsers();
      setUsers(resolveList(response).map(normalizeUser));
    } catch (error) {
      message.error(error?.message || "Unable to load users");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openEditModal(user) {
    setEditingUser(user);
    form.setFieldsValue({
      avatar: user.avatar,
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      phoneNumber: user.phoneNumber,
      address: user.address,
      gender: user.gender,
      role: user.role,
      weight: user.weight,
      height: user.height,
      experienceYears: user.experienceYears,
      certification: user.certification,
      stableName: user.stableName,
      stableAddress: user.stableAddress,
    });
  }

  async function handleUpdate() {
    const values = await form.validateFields();
    setIsUpdating(true);

    try {
      // Giữ vững quyền gốc của tài khoản để gọi chính xác endpoint tương ứng
      const currentRole = editingUser.role;

      // Khởi tạo Payload gốc dùng chung cho mọi cấu trúc DTO
      const payload = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address,
        dateOfBirth: values.dateOfBirth,
        avatar: values.avatar,
        gender: Number(values.gender),
      };

      const normalizedRoleLower = currentRole.toLowerCase();

      if (normalizedRoleLower.includes("jockey")) {
        payload.weight = values.weight ? Number(values.weight) : undefined;
        payload.height = values.height ? Number(values.height) : undefined;
      } else if (normalizedRoleLower.includes("referee")) {
        payload.experienceYears = values.experienceYears
          ? Number(values.experienceYears)
          : undefined;
        payload.certification = values.certification || undefined;
      } else if (
        normalizedRoleLower.includes("owner") ||
        normalizedRoleLower.includes("horse")
      ) {
        payload.stableName = values.stableName || undefined;
        payload.stableAddress = values.stableAddress || undefined;
      }

      // Thực thi request lên API dựa theo đúng cấu trúc endpoint phân loại quyền
      const apiResponse = await updateUserAccount(
        editingUser.id,
        currentRole,
        payload,
      );
      message.success("User updated");

      // Trộn cấu trúc dữ liệu mới từ Form cùng dữ liệu cũ nhằm đồng bộ giao diện local chuẩn xác
      const updatedData = {
        ...editingUser,
        ...values,
        gender: Number(values.gender),
        weight: values.weight ? Number(values.weight) : editingUser.weight,
        height: values.height ? Number(values.height) : editingUser.height,
        experienceYears: values.experienceYears
          ? Number(values.experienceYears)
          : editingUser.experienceYears,
        certification: values.certification || editingUser.certification,
        stableName: values.stableName || editingUser.stableName,
        stableAddress: values.stableAddress || editingUser.stableAddress,
      };

      // Ưu tiên ghi đè bằng Object sạch trả về từ API (nếu Backend có trả về dữ liệu mới)
      const finalUserData = normalizeUser(
        apiResponse?.data || apiResponse || updatedData,
        users.length,
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...finalUserData } : user,
        ),
      );
      setEditingUser(null);
    } catch (error) {
      message.error(error?.message || "Unable to update user");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDisable(user) {
    try {
      await deleteUser(user.id);
      message.success("Account disabled");
      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id ? { ...item, status: "Disabled" } : item,
        ),
      );
    } catch (error) {
      message.error(error?.message || "Unable to disable account");
    }
  }

  const renderDynamicFields = () => {
    return (
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.role !== currentValues.role
        }
      >
        {({ getFieldValue }) => {
          const currentRole = String(getFieldValue("role") || "").toLowerCase();

          if (currentRole.includes("jockey")) {
            return (
              <>
                <Form.Item label="Cân nặng (kg)" name="weight">
                  <Input type="number" />
                </Form.Item>
                <Form.Item label="Chiều cao (cm)" name="height">
                  <Input type="number" />
                </Form.Item>
              </>
            );
          }
          if (currentRole.includes("referee")) {
            return (
              <>
                <Form.Item label="Số năm kinh nghiệm" name="experienceYears">
                  <Input type="number" />
                </Form.Item>
                <Form.Item label="Chứng chỉ trọng tài" name="certification">
                  <Input />
                </Form.Item>
              </>
            );
          }
          if (currentRole.includes("owner") || currentRole.includes("horse")) {
            return (
              <>
                <Form.Item label="Tên trang trại ngựa" name="stableName">
                  <Input />
                </Form.Item>
                <Form.Item label="Địa chỉ trang trại" name="stableAddress">
                  <Input />
                </Form.Item>
              </>
            );
          }
          return null;
        }}
      </Form.Item>
    );
  };

  const columns = useMemo(
    () => [
      {
        title: "Avatar",
        dataIndex: "avatar",
        fixed: "left",
        width: 88,
        render: (avatar, record) => {
          const cleanSrc = avatar && avatar.trim() !== "" ? avatar : null;
          return (
            <Avatar className="user-management-avatar" size={44} src={cleanSrc}>
              {record.fullName
                ? record.fullName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "?"}
            </Avatar>
          );
        },
      },
      {
        title: "Email",
        dataIndex: "email",
        width: 220,
        render: (value) => <Text strong>{value}</Text>,
      },
      {
        title: "Full Name",
        dataIndex: "fullName",
        fixed: "left",
        width: 190,
      },
      {
        title: "Date of Birth",
        dataIndex: "dateOfBirth",
        width: 130,
        render: formatDate,
      },
      {
        title: "Phone Number",
        dataIndex: "phoneNumber",
        width: 150,
      },
      {
        title: "Address",
        dataIndex: "address",
        width: 260,
        ellipsis: true,
      },
      {
        title: "Role",
        dataIndex: "role",
        width: 130,
        render: (role) => <Tag color={roleColor(role)}>{role}</Tag>,
      },
      {
        title: "Status",
        dataIndex: "status",
        width: 120,
        render: (status) => (
          <Tag color={statusColor(status)}>{String(status)}</Tag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 180,
        render: (_, record) => (
          <Space>
            <Button
              className="user-management-link-btn"
              size="small"
              onClick={() => openEditModal(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Disable tài khoản?"
              description="Action này sẽ gọi API delete user."
              okText="Disable"
              cancelText="Hủy"
              onConfirm={() => handleDisable(record)}
            >
              <Button danger size="small">
                Disable
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <section className="user-management">
      <style>{`
        .user-management-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .user-management-kicker {
          color: #007a68;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .user-management-header h1.ant-typography {
          margin: 6px 0 0;
          color: #06332e;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          font-weight: 950;
          letter-spacing: 0;
        }

        .user-management-card {
          border: 1px solid #ccefe7;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 22px 70px rgba(13, 70, 63, 0.08);
          overflow: hidden;
        }

        .user-management-table.ant-table-wrapper .ant-table-thead > tr > th {
          color: #52726e;
          background: #f3fffc;
          font-weight: 950;
        }

        .user-management-table.ant-table-wrapper .ant-table-tbody > tr > td {
          color: #0d2321;
          background: #fff;
        }

        .user-management-avatar.ant-avatar {
          color: #06332e;
          background: #d9fbf4;
          font-weight: 950;
        }

        .user-management-link-btn.ant-btn {
          border-color: #bdeee5;
          color: #006755;
          font-weight: 850;
          background: #fff;
        }

        .user-management-link-btn.ant-btn:hover {
          border-color: #69f8dd !important;
          color: #006755 !important;
        }

        .user-management-refresh.ant-btn {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        .user-management-refresh.ant-btn:hover {
          border-color: transparent !important;
          color: #06332e !important;
          background: #75ffe6 !important;
        }

        .user-management-edit-modal .ant-modal-content {
          border-radius: 8px;
        }

        @media (max-width: 920px) {
          .user-management-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="user-management-header">
        <div>
          <div className="user-management-kicker">Admin dashboard</div>
          <Title level={1}>User Management</Title>
        </div>
        <Button className="user-management-refresh" onClick={loadUsers}>
          Refresh
        </Button>
      </div>

      <div className="user-management-card">
        <Table
          className="user-management-table"
          columns={columns}
          dataSource={users}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} users`,
          }}
          scroll={{ x: 1450 }}
        />
      </div>

      <Modal
        className="user-management-edit-modal"
        title="Chỉnh sửa tài khoản"
        open={Boolean(editingUser)}
        okText="Update"
        cancelText="Hủy"
        confirmLoading={isUpdating}
        onCancel={() => setEditingUser(null)}
        onOk={handleUpdate}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Ảnh đại diện" name="avatar">
            <Input placeholder="Avatar URL" />
          </Form.Item>
          <Form.Item
            label="Tên"
            name="fullName"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Ngày sinh" name="dateOfBirth">
            <Input placeholder="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phoneNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address">
            <Input />
          </Form.Item>

          <Form.Item
            label="Giới tính"
            name="gender"
            rules={[{ required: true, message: "Gender is required" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value={1}>Nam</Select.Option>
              <Select.Option value={2}>Nữ</Select.Option>
              <Select.Option value={0}>Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Quyền (Role)" name="role">
            <Input disabled placeholder="Quyền hạn gốc" />
          </Form.Item>

          {renderDynamicFields()}
        </Form>
      </Modal>
    </section>
  );
}

export default UserManagement;
