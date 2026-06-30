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
  DatePicker,
  Descriptions,
} from "antd";
import "antd/dist/reset.css";
import {
  deleteUser,
  getUsers,
  searchUsersByName,
  updateAccountStatus,
  updateUserAccount,
  getUserById,
} from "../../api/services/user.service";
import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const { Text, Title } = Typography;
const { Search } = Input;

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

function getTimeValue(value) {
  if (!value) return 0;

  if (typeof value === "string" && value.includes("/")) {
    const parsedDate = dayjs(value, "DD/MM/YYYY", true);

    return parsedDate.isValid() ? parsedDate.valueOf() : 0;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getObjectIdTime(value) {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    return 0;
  }

  return parseInt(value.slice(0, 8), 16) * 1000;
}

function sortNewestUserFirst(a, b) {
  const aTime = Math.max(
    getTimeValue(a.createdAt),
    getTimeValue(a.updatedAt),
    getObjectIdTime(a.id),
  );
  const bTime = Math.max(
    getTimeValue(b.createdAt),
    getTimeValue(b.updatedAt),
    getObjectIdTime(b.id),
  );

  return bTime - aTime;
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
    createdAt: pick(user, ["createdAt", "createdDate", "registeredAt"], ""),
    updatedAt: pick(user, ["updatedAt", "modifiedAt"], ""),
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
  const [searchKey, setSearchKey] = useState("");
  const [statusChangingId, setStatusChangingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const response = await getUsers();
      setUsers(
        resolveList(response).map(normalizeUser).sort(sortNewestUserFirst),
      );
      setSearchKey("");
    } catch (error) {
      message.error(error?.message || "Unable to load users");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchRole = selectedRole ? user.role === selectedRole : true;
      const matchStatus = selectedStatus
        ? user.status === selectedStatus
        : true;
      return matchRole && matchStatus;
    });
  }, [users, selectedRole, selectedStatus]);

  async function handleSearch(value) {
    setSearchKey(value);

    // Nếu thanh tìm kiếm bị xóa trống, tự động quay về tải lại toàn bộ data gốc
    if (!value || value.trim() === "") {
      return loadUsers();
    }

    setIsLoading(true);
    try {
      const response = await searchUsersByName(value.trim());
      setUsers(
        resolveList(response).map(normalizeUser).sort(sortNewestUserFirst),
      );
    } catch (error) {
      message.error(error?.message || "Tìm kiếm thất bại");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id, nextStatus) {
    setStatusChangingId(id);
    try {
      await updateAccountStatus(id, nextStatus);
      message.success(`Đã cập nhật trạng thái sang ${nextStatus}`);

      // Đồng bộ trạng thái mới vào danh sách đang hiển thị ở client
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === id ? { ...user, status: nextStatus } : user,
        ),
      );
    } catch (error) {
      message.error(error?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setStatusChangingId(null);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openEditModal(user) {
    setEditingUser(user);

    let datejsValue = null;
    if (user.dateOfBirth) {
      // Thử parse định dạng DD/MM/YYYY trước, nếu thất bại sẽ fallback theo ISO chuẩn
      datejsValue = dayjs(user.dateOfBirth, "DD/MM/YYYY").isValid()
        ? dayjs(user.dateOfBirth, "DD/MM/YYYY")
        : dayjs(user.dateOfBirth);
    }

    form.setFieldsValue({
      avatar: user.avatar,
      fullName: user.fullName,
      dateOfBirth: datejsValue && datejsValue.isValid() ? datejsValue : null,
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

      const apiFormattedDate = values.dateOfBirth
        ? values.dateOfBirth.format("DD/MM/YYYY")
        : "";

      // Khởi tạo Payload gốc dùng chung cho mọi cấu trúc DTO
      const payload = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        address: values.address,
        dateOfBirth: apiFormattedDate,
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
        dateOfBirth: apiFormattedDate,
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

  // Hàm gọi API lấy chi tiết tài khoản
  async function openDetailModal(id) {
    setIsDetailLoading(true);
    try {
      const data = await getUserById(id);
      setDetailUser(data);
    } catch (error) {
      message.error(error?.message || "Không thể tải thông tin chi tiết");
    } finally {
      setIsDetailLoading(false);
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
        width: 140,
        render: (status, record) => (
          <Select
            value={status}
            size="small"
            style={{ width: 110 }}
            loading={statusChangingId === record.id}
            onChange={(nextValue) => handleStatusChange(record.id, nextValue)}
            options={[
              {
                value: "Active",
                label: <span style={{ color: "green" }}>Active</span>,
              },
              {
                value: "Inactive",
                label: <span style={{ color: "red" }}>Inactive</span>,
              },
              {
                value: "Banned",
                label: <span style={{ color: "orange" }}>Banned</span>,
              },
            ]}
          />
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
              size="small"
              type="primary"
              ghost
              loading={isDetailLoading}
              onClick={() => openDetailModal(record.id)}
            >
              Detail
            </Button>
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
    [statusChangingId],
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

        .user-management-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          width: auto;
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

        .user-management-datepicker {
          width: 100%
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
        <div className="user-management-actions">
          <Select
            placeholder="Filter by Role"
            allowClear
            style={{ width: 140 }}
            onChange={(val) => setSelectedRole(val)}
          >
            <Select.Option value="Spectator">Spectator</Select.Option>
            <Select.Option value="Jockey">Jockey</Select.Option>
            <Select.Option value="Referee">Referee</Select.Option>
            <Select.Option value="Horse-Owner">Horse-Owner</Select.Option>
          </Select>

          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 140 }}
            onChange={(val) => setSelectedStatus(val)}
          >
            <Select.Option value="Active">Active</Select.Option>
            <Select.Option value="Inactive">Inactive</Select.Option>
            <Select.Option value="Banned">Banned</Select.Option>
            <Select.Option value="Disabled">Disabled</Select.Option>
          </Select>
          <Search
            className="user-management-search-input"
            placeholder="Search users..."
            allowClear
            enterButton="Search"
            size="middle"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            onSearch={handleSearch}
            loading={isLoading}
          />
          <Button className="user-management-refresh" onClick={loadUsers}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="user-management-card">
        <Table
          className="user-management-table"
          columns={columns}
          dataSource={filteredUsers}
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
            <DatePicker
              className="user-management-datepicker"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
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

      {/* Modal hiển thị chi tiết tài khoản */}
      <Modal
        title="Thông tin chi tiết tài khoản"
        open={Boolean(detailUser)}
        footer={[
          <Button key="close" onClick={() => setDetailUser(null)}>
            Đóng
          </Button>,
        ]}
        onCancel={() => setDetailUser(null)}
        width={700}
      >
        {detailUser && (
          <div style={{ paddingTop: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Avatar size={80} src={detailUser.avatar}>
                {detailUser.fullName
                  ? detailUser.fullName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "?"}
              </Avatar>
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Họ và tên" span={2}>
                <Text strong>{detailUser.fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                {detailUser.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {detailUser.phoneNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {detailUser.dateOfBirth || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {detailUser.gender === 1
                  ? "Nam"
                  : detailUser.gender === 2
                    ? "Nữ"
                    : "Khác"}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag color={roleColor(detailUser.role)}>{detailUser.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                <Tag color={statusColor(detailUser.status)}>
                  {detailUser.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {detailUser.address || "N/A"}
              </Descriptions.Item>

              {/* Các trường động theo Role Spectator */}
              {String(detailUser.role).toLowerCase().includes("spectator") && (
                <>
                  <Descriptions.Item label="Số dư điểm">
                    {detailUser.pointBalance ?? 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng điểm tích lũy">
                    {detailUser.totalPoints ?? 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng số lượt cược">
                    {detailUser.totalBets ?? 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tỷ lệ thắng cược">
                    {detailUser.winRate ?? 0}%
                  </Descriptions.Item>
                </>
              )}

              {/* Các trường động theo Role Jockey */}
              {String(detailUser.role).toLowerCase().includes("jockey") && (
                <>
                  <Descriptions.Item label="Cân nặng">
                    {detailUser.weight ? `${detailUser.weight} kg` : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chiều cao">
                    {detailUser.height ? `${detailUser.height} cm` : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái nài ngựa">
                    {detailUser.jockeyStatus || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tỷ lệ thắng">
                    {detailUser.winRate ?? 0}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Số dư tài khoản">
                    {(detailUser.balance ?? 0).toLocaleString()} VND
                  </Descriptions.Item>
                  <Descriptions.Item label="Số dư đóng băng">
                    {(detailUser.heldBalance ?? 0).toLocaleString()} VND
                  </Descriptions.Item>
                  <Descriptions.Item label="Điểm uy tín" span={2}>
                    {detailUser.reputationPoints ?? 0}
                  </Descriptions.Item>
                  {detailUser.licenses && detailUser.licenses.length > 0 && (
                    <Descriptions.Item label="Chứng chỉ hành nghề" span={2}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        {detailUser.licenses.map((lic, idx) => (
                          <div key={lic._id || idx}>
                            <Text code>{lic.licenseCode}</Text> (Bắt đầu:{" "}
                            {lic.racingStartDate || "N/A"})
                          </div>
                        ))}
                      </div>
                    </Descriptions.Item>
                  )}
                </>
              )}

              {/* Các trường động theo Role Horse-Owner */}
              {(String(detailUser.role).toLowerCase().includes("owner") ||
                String(detailUser.role).toLowerCase().includes("horse")) && (
                <>
                  <Descriptions.Item label="Tên trang trại">
                    {detailUser.stableName || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ trang trại">
                    {detailUser.stableAddress || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số dư tài khoản">
                    {(detailUser.balance ?? 0).toLocaleString()} VND
                  </Descriptions.Item>
                  <Descriptions.Item label="Số dư đóng băng">
                    {(detailUser.heldBalance ?? 0).toLocaleString()} VND
                  </Descriptions.Item>
                  <Descriptions.Item label="Tỷ lệ thắng">
                    {detailUser.winRate ?? 0}%
                  </Descriptions.Item>
                  <Descriptions.Item label="Điểm uy tín">
                    {detailUser.reputationPoints ?? 0}
                  </Descriptions.Item>
                </>
              )}

              {/* Các trường động theo Role Referee */}
              {String(detailUser.role).toLowerCase().includes("referee") && (
                <>
                  <Descriptions.Item label="Số năm kinh nghiệm">
                    {detailUser.experienceYears
                      ? `${detailUser.experienceYears} năm`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chứng chỉ trọng tài">
                    {detailUser.certification || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số trận điều hành">
                    {detailUser.racesAttempt ?? 0}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điểm uy tín">
                    {detailUser.reputationPoints ?? 0}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default UserManagement;
