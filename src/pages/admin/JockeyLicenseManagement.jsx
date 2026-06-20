import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Form,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  List,
} from "antd";
import "antd/dist/reset.css";
import { getJockeysWithLicenses } from "../../api/services/user.service";
import { updateJockeyStatus } from "../../api/services/jockeyLicense.service";

const { Text, Title } = Typography;

function pick(source, keys, fallback = "") {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }
  return fallback;
}

function formatDate(value) {
  if (!value) return "N/A";
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

function normalizeJockey(jockey, index) {
  const id = pick(jockey, ["id", "_id", "userId"], `jockey-${index}`);
  const profileId = pick(jockey, ["profileId", "jockeyProfileId"], "");

  return {
    key: id,
    id,
    profileId,
    avatar: pick(jockey, ["avatar", "avatarUrl", "imageUrl", "photoUrl"], ""),
    email: pick(jockey, ["email", "mail"], "N/A"),
    fullName: pick(
      jockey,
      ["fullName", "name", "displayName", "username"],
      "Unnamed Jockey",
    ),
    dateOfBirth: pick(jockey, ["dateOfBirth", "dob", "birthDate"], ""),
    phoneNumber: pick(jockey, ["phoneNumber", "phone", "mobile"], "N/A"),
    address: pick(jockey, ["address", "location"], "N/A"),
    gender:
      jockey?.gender !== undefined && jockey?.gender !== null
        ? Number(jockey.gender)
        : 1,
    weight: jockey?.weight || "N/A",
    height: jockey?.height || "N/A",
    jockeyStatus: jockey?.jockeyStatus || "Pending_Approval",
    licenses: Array.isArray(jockey?.licenses) ? jockey.licenses : [],
    winRate: jockey?.winRate || 0,
    reputationPoints: jockey?.reputationPoints || 0,
  };
}

function getJockeyStatusColor(status) {
  switch (status) {
    case "Pending_Approval":
      return "orange";
    case "Rejected":
      return "red";
    case "Available":
      return "green";
    case "Contracted":
      return "blue";
    case "Busy":
      return "purple";
    case "Resting":
      return "default";
    case "Injured":
      return "magenta";
    case "Banned":
      return "volcano";
    default:
      return "cyan";
  }
}

function JockeyLicenseManagement() {
  const [jockeys, setJockeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);
  const [statusChangingId, setStatusChangingId] = useState(null);
  const [viewingLicensesJockey, setViewingLicensesJockey] = useState(null);

  async function loadJockeys() {
    setIsLoading(true);
    try {
      // Gọi API lấy toàn bộ danh sách Jockey
      const data = await getJockeysWithLicenses();
      setJockeys(data.map(normalizeJockey));
    } catch (error) {
      message.error(error?.message || "Unable to load jockeys");
    } finally {
      setIsLoading(false);
    }
  }

  // Thực hiện lọc dữ liệu cục bộ phía Client khi admin chọn Filter
  const filteredJockeys = useMemo(() => {
    if (!selectedStatusFilter) return jockeys;
    return jockeys.filter(
      (jockey) => jockey.jockeyStatus === selectedStatusFilter,
    );
  }, [jockeys, selectedStatusFilter]);

  async function handleJockeyStatusChange(profileId, recordId, nextStatus) {
    if (!profileId) {
      message.error("Không tìm thấy Profile ID của Jockey");
      return;
    }

    setStatusChangingId(recordId);
    try {
      await updateJockeyStatus(profileId, nextStatus);
      message.success(`Đã cập nhật trạng thái hoạt động sang ${nextStatus}`);

      // Đồng bộ trạng thái mới vào danh sách hiển thị local
      setJockeys((current) =>
        current.map((jockey) =>
          jockey.id === recordId
            ? { ...jockey, jockeyStatus: nextStatus }
            : jockey,
        ),
      );
    } catch (error) {
      message.error(error?.message || "Cập nhật trạng thái Jockey thất bại");
    } finally {
      setStatusChangingId(null);
    }
  }

  useEffect(() => {
    loadJockeys();
  }, []);

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
        title: "Full Name",
        dataIndex: "fullName",
        fixed: "left",
        width: 190,
      },
      {
        title: "Email",
        dataIndex: "email",
        width: 220,
        render: (value) => <Text strong>{value}</Text>,
      },
      {
        title: "Phone Number",
        dataIndex: "phoneNumber",
        width: 150,
      },
      {
        title: "Chiều cao/Cân nặng",
        key: "specs",
        width: 160,
        render: (_, record) => `${record.height} cm / ${record.weight} kg`,
      },
      {
        title: "Số chứng chỉ",
        dataIndex: "licenses",
        width: 130,
        render: (licenses) => (
          <Tag color="blue">{licenses.length} chứng chỉ</Tag>
        ),
      },
      {
        title: "Jockey Status",
        dataIndex: "jockeyStatus",
        width: 180,
        render: (jockeyStatus, record) => (
          <Select
            value={jockeyStatus}
            size="small"
            style={{ width: 155 }}
            loading={statusChangingId === record.id}
            onChange={(nextValue) =>
              handleJockeyStatusChange(record.profileId, record.id, nextValue)
            }
            options={[
              {
                value: "Pending_Approval",
                label: (
                  <span style={{ color: "orange" }}>Pending Approval</span>
                ),
              },
              {
                value: "Available",
                label: <span style={{ color: "green" }}>Available</span>,
              },
              {
                value: "Contracted",
                label: <span style={{ color: "blue" }}>Contracted</span>,
              },
              {
                value: "Busy",
                label: <span style={{ color: "purple" }}>Busy</span>,
              },
              {
                value: "Resting",
                label: <span style={{ color: "gray" }}>Resting</span>,
              },
              {
                value: "Injured",
                label: <span style={{ color: "magenta" }}>Injured</span>,
              },
              {
                value: "Rejected",
                label: <span style={{ color: "red" }}>Rejected</span>,
              },
              {
                value: "Banned",
                label: <span style={{ color: "darkred" }}>Banned</span>,
              },
            ]}
          />
        ),
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 140,
        render: (_, record) => (
          <Button
            className="user-management-link-btn"
            size="small"
            onClick={() => setViewingLicensesJockey(record)}
          >
            Xem chứng chỉ
          </Button>
        ),
      },
    ],
    [statusChangingId, jockeys],
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
          <Title level={1}>Jockey License Management</Title>
        </div>
        <div className="user-management-actions">
          <Select
            placeholder="Lọc theo Jockey Status"
            allowClear
            style={{ width: 220 }}
            onChange={(val) => setSelectedStatusFilter(val)}
          >
            <Select.Option value="Pending_Approval">
              Pending Approval
            </Select.Option>
            <Select.Option value="Available">Available</Select.Option>
            <Select.Option value="Contracted">Contracted</Select.Option>
            <Select.Option value="Busy">Busy</Select.Option>
            <Select.Option value="Resting">Resting</Select.Option>
            <Select.Option value="Injured">Injured</Select.Option>
            <Select.Option value="Rejected">Rejected</Select.Option>
            <Select.Option value="Banned">Banned</Select.Option>
          </Select>

          <Button className="user-management-refresh" onClick={loadJockeys}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="user-management-card">
        <Table
          className="user-management-table"
          columns={columns}
          dataSource={filteredJockeys}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} jockeys`,
          }}
          scroll={{ x: 1300 }}
        />
      </div>

      {/* Modal hiển thị chi tiết danh sách bằng cấp/chứng chỉ của Jockey được chọn */}
      <Modal
        title={`Danh sách chứng chỉ - ${viewingLicensesJockey?.fullName}`}
        open={Boolean(viewingLicensesJockey)}
        footer={[
          <Button key="close" onClick={() => setViewingLicensesJockey(null)}>
            Đóng
          </Button>,
        ]}
        onCancel={() => setViewingLicensesJockey(null)}
      >
        {viewingLicensesJockey?.licenses.length === 0 ? (
          <Text
            type="secondary"
            style={{ display: "block", padding: "16px 0" }}
          >
            Jockey này chưa cập nhật bất kỳ chứng chỉ nào hệ thống.
          </Text>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={viewingLicensesJockey?.licenses}
            renderItem={(license) => (
              <List.Item
                key={license.licenseCode}
                extra={
                  license.licenseUrl ? (
                    <div style={{ marginTop: 8, marginBottom: 8 }}>
                      <img
                        src={license.licenseUrl}
                        alt={`Chứng chỉ ${license.licenseCode}`}
                        style={{
                          width: "100%",
                          maxWidth: "220px",
                          maxHeight: "140px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #f0f0f0",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                        onError={(e) => {
                          // Fallback nếu URL là file PDF không hiển thị trực tiếp bằng thẻ img được
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  ) : null
                }
                actions={[
                  <a
                    href={license.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key="view-link"
                    style={{ fontWeight: 700, color: "#007a68" }}
                  >
                    Xem file gốc chi tiết
                  </a>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Text strong>Mã chứng chỉ: {license.licenseCode}</Text>
                  }
                  description={`Ngày bắt đầu đua: ${formatDate(license.racingStartDate)}`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </section>
  );
}

export default JockeyLicenseManagement;
