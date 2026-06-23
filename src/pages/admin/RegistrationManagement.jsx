import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import {
  acceptRegistrationToWaitlist,
  confirmRegistration,
  getRegistrationById,
  getRegistrations,
  rejectRegistration,
} from "../../api/services/registration.service";

const { Title, Text } = Typography;

const REGISTRATION_STATUSES = [
  "Waitlisted",
  "Pending",
  "Confirmed",
  "Rejected",
];

function resolveList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.registrations)) return response.registrations;
  return [];
}

function formatMoney(value) {
  if (value === undefined || value === null) return "N/A";
  return Number(value).toLocaleString("vi-VN") + " VND";
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function statusColor(status) {
  switch (status) {
    case "Pending":
      return "orange";
    case "Confirmed":
      return "green";
    case "Rejected":
      return "red";
    case "Waitlisted":
      return "blue";
    default:
      return "default";
  }
}

function normalizeRegistration(item, index) {
  const id = item?._id || item?.id || `registration-${index}`;

  return {
    key: id,
    id,
    tournamentId: item?.tournamentId || "",
    raceId: item?.raceId || "",
    tournamentTitle: item?.tournamentTitle || "N/A",
    horseName: item?.horseName || "N/A",
    jockeyName: item?.jockeyName || "N/A",
    ownerName: item?.ownerName || "N/A",
    entryFee: item?.entryFee ?? 0,
    gateNumber: item?.gateNumber ?? "N/A",
    status: item?.status || "Pending",
    registeredAt: item?.registeredAt || "",
  };
}

function RegistrationManagement() {
  const [confirmForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const [registrations, setRegistrations] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTournamentId, setFilterTournamentId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [detailRegistration, setDetailRegistration] = useState(null);
  const [confirmingRegistration, setConfirmingRegistration] = useState(null);
  const [rejectingRegistration, setRejectingRegistration] = useState(null);

  async function loadRegistrations(
    status = filterStatus,
    tournamentId = filterTournamentId,
  ) {
    setIsLoading(true);

    try {
      const response = await getRegistrations({
        status,
        tournamentId,
      });

      setRegistrations(resolveList(response).map(normalizeRegistration));
    } catch (error) {
      message.error(error?.message || "Unable to load registrations");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function openDetailModal(record) {
    setIsLoading(true);

    try {
      const response = await getRegistrationById(record.id);
      setDetailRegistration(response);
    } catch (error) {
      message.error(error?.message || "Unable to load registration detail");
    } finally {
      setIsLoading(false);
    }
  }

  function openConfirmModal(record) {
    setConfirmingRegistration(record);
    confirmForm.resetFields();
    confirmForm.setFieldsValue({
      raceId: record.raceId || "",
      gateNumber: record.gateNumber !== "N/A" ? record.gateNumber : undefined,
    });
  }

  async function handleConfirm() {
    const values = await confirmForm.validateFields();

    setIsSaving(true);

    try {
      await confirmRegistration(confirmingRegistration.id, values);
      message.success("Registration confirmed");

      setConfirmingRegistration(null);
      confirmForm.resetFields();
      await loadRegistrations();
    } catch (error) {
      message.error(error?.message || "Unable to confirm registration");
    } finally {
      setIsSaving(false);
    }
  }

  function openRejectModal(record) {
    setRejectingRegistration(record);
    rejectForm.resetFields();
  }

  async function handleReject() {
    const values = await rejectForm.validateFields();

    setIsSaving(true);

    try {
      await rejectRegistration(rejectingRegistration.id, values);
      message.success("Registration rejected");

      setRejectingRegistration(null);
      rejectForm.resetFields();
      await loadRegistrations();
    } catch (error) {
      message.error(error?.message || "Unable to reject registration");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAcceptToWaitlist(record) {
    setIsSaving(true);

    try {
      await acceptRegistrationToWaitlist(record.id, {
        raceId: record.raceId,
        gateNumber: record.gateNumber,
      });

      message.success("Moved to waitlist");
      await loadRegistrations();
    } catch (error) {
      message.error(error?.message || "Unable to move to waitlist");
    } finally {
      setIsSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        title: "Tournament",
        dataIndex: "tournamentTitle",
        fixed: "left",
        width: 260,
        render: (value) => <Text strong>{value}</Text>,
      },
      {
        title: "Horse",
        dataIndex: "horseName",
        width: 160,
      },
      {
        title: "Jockey",
        dataIndex: "jockeyName",
        width: 190,
      },
      {
        title: "Owner",
        dataIndex: "ownerName",
        width: 190,
      },
      {
        title: "Entry Fee",
        dataIndex: "entryFee",
        width: 150,
        render: formatMoney,
      },
      {
        title: "Gate",
        dataIndex: "gateNumber",
        width: 90,
      },
      {
        title: "Status",
        dataIndex: "status",
        width: 130,
        render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
      },
      {
        title: "Registered At",
        dataIndex: "registeredAt",
        width: 180,
        render: formatDate,
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 210,
        render: (_, record) => (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(record)}
            />

            <Button
              type="text"
              icon={<CheckOutlined />}
              onClick={() => openConfirmModal(record)}
            />

            <Button
              type="text"
              icon={<CloseOutlined />}
              danger
              onClick={() => openRejectModal(record)}
            />

            <Button
              type="text"
              icon={<FieldTimeOutlined />}
              onClick={() => handleAcceptToWaitlist(record)}
            />
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <section className="registration-management">
      <style>{`
        .registration-management-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .registration-management-kicker {
          color: #007a68;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .registration-management-header h1.ant-typography {
          margin: 6px 0 0;
          color: #06332e;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          font-weight: 950;
        }

        .registration-management-card {
          border: 1px solid #ccefe7;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 22px 70px rgba(13, 70, 63, 0.08);
          overflow: hidden;
        }

        .registration-management-table.ant-table-wrapper .ant-table-thead > tr > th {
          color: #52726e;
          background: #f3fffc;
          font-weight: 950;
        }

        .registration-management-table.ant-table-wrapper .ant-table-tbody > tr > td {
          color: #0d2321;
        }

        .registration-management-link-btn.ant-btn {
          border-color: #bdeee5;
          color: #006755;
          font-weight: 850;
        }

        .registration-management-primary.ant-btn {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        @media (max-width: 920px) {
          .registration-management-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="registration-management-header">
        <div>
          <div className="registration-management-kicker">Admin dashboard</div>
          <Title level={1}>Registration Management</Title>
        </div>

        <Space wrap>
          <Select
            value={filterStatus}
            style={{ width: 170 }}
            options={[
              { label: "All Status", value: "" },
              ...REGISTRATION_STATUSES.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            onChange={(value) => {
              setFilterStatus(value);
              loadRegistrations(value, filterTournamentId);
            }}
          />

          <Input
            allowClear
            placeholder="Tournament ID"
            value={filterTournamentId}
            style={{ width: 260 }}
            onChange={(event) => setFilterTournamentId(event.target.value)}
            onPressEnter={() =>
              loadRegistrations(filterStatus, filterTournamentId)
            }
          />

          <Button
            className="registration-management-link-btn"
            onClick={() => loadRegistrations()}
          >
            Search
          </Button>

          <Button
            className="registration-management-primary"
            onClick={() => {
              setFilterStatus("");
              setFilterTournamentId("");
              loadRegistrations("", "");
            }}
          >
            Reset
          </Button>
        </Space>
      </div>

      <div className="registration-management-card">
        <Table
          className="registration-management-table"
          columns={columns}
          dataSource={registrations}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} registrations`,
          }}
          scroll={{ x: 1570 }}
        />
      </div>

      <Modal
        title="Registration Detail"
        open={Boolean(detailRegistration)}
        footer={null}
        width={800}
        onCancel={() => setDetailRegistration(null)}
      >
        {detailRegistration && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">
              {detailRegistration._id}
            </Descriptions.Item>

            <Descriptions.Item label="Tournament">
              {detailRegistration.tournamentTitle}
            </Descriptions.Item>

            <Descriptions.Item label="Tournament ID">
              {detailRegistration.tournamentId}
            </Descriptions.Item>

            <Descriptions.Item label="Horse">
              {detailRegistration.horseName}
            </Descriptions.Item>

            <Descriptions.Item label="Horse ID">
              {detailRegistration.horseId}
            </Descriptions.Item>

            <Descriptions.Item label="Jockey">
              {detailRegistration.jockeyName}
            </Descriptions.Item>

            <Descriptions.Item label="Jockey ID">
              {detailRegistration.jockeyId}
            </Descriptions.Item>

            <Descriptions.Item label="Owner">
              {detailRegistration.ownerName}
            </Descriptions.Item>

            <Descriptions.Item label="Owner ID">
              {detailRegistration.ownerId}
            </Descriptions.Item>

            <Descriptions.Item label="Race ID">
              {detailRegistration.raceId || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Gate Number">
              {detailRegistration.gateNumber || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Entry Fee">
              {formatMoney(detailRegistration.entryFee)}
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color={statusColor(detailRegistration.status)}>
                {detailRegistration.status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Registered At">
              {formatDate(detailRegistration.registeredAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Confirmed At">
              {formatDate(detailRegistration.confirmedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Rejected Reason">
              {detailRegistration.rejectedReason || "N/A"}
            </Descriptions.Item>

            <Descriptions.Item label="Rejected At">
              {formatDate(detailRegistration.rejectedAt)}
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {formatDate(detailRegistration.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Confirm Registration"
        open={Boolean(confirmingRegistration)}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={isSaving}
        onOk={handleConfirm}
        onCancel={() => setConfirmingRegistration(null)}
      >
        <Form form={confirmForm} layout="vertical">
          <Form.Item
            label="Race ID"
            name="raceId"
            rules={[{ required: true, message: "Race ID is required" }]}
          >
            <Input placeholder="Enter race ID" />
          </Form.Item>

          <Form.Item
            label="Gate Number"
            name="gateNumber"
            rules={[{ required: true, message: "Gate number is required" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reject Registration"
        open={Boolean(rejectingRegistration)}
        okText="Reject"
        cancelText="Cancel"
        confirmLoading={isSaving}
        onOk={handleReject}
        onCancel={() => setRejectingRegistration(null)}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: "Reason is required" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter rejected reason" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default RegistrationManagement;
