import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  getJockeyInvitations,
  getJockeyInvitationById,
  getJockeyInvitationContract,
  respondToJockeyInvitation,
} from "../../api/services/jockey.service";

const statusColor = {
  Pending: "gold",
  Accepted: "green",
  Rejected: "red",
};

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function pickFirstValue(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
}

function normalizeInvitation(invitation = {}) {
  const owner = invitation.owner || invitation.ownerInfo || invitation.horseOwner || {};
  const horse = invitation.horse || invitation.horseInfo || {};
  const tournament = invitation.tournament || invitation.tournamentInfo || {};

  return {
    ...invitation,
    id: pickFirstValue(invitation, ["id", "_id", "invitationId"]),
    owner: pickFirstValue(
      invitation,
      ["ownerName", "horseOwnerName"],
      pickFirstValue(owner, ["fullName", "name"], "N/A"),
    ),
    horse: pickFirstValue(invitation, ["horseName"], pickFirstValue(horse, ["name", "horseName"], "N/A")),
    tournament: pickFirstValue(
      invitation,
      ["tournamentTitle", "tournamentName"],
      pickFirstValue(tournament, ["title", "name"], "N/A"),
    ),
    location: pickFirstValue(invitation, ["location"], pickFirstValue(tournament, ["location"], "N/A")),
    status: pickFirstValue(invitation, ["status", "invitationStatus"], "Pending"),
    message: pickFirstValue(invitation, ["message"], ""),
    proposeContractAmount: pickFirstValue(invitation, ["proposeContractAmount", "contractAmount", "fee"], 0),
    proposeOwnerShareRate: pickFirstValue(invitation, ["proposeOwnerShareRate", "ownerShareRate"], 0),
    proposeJockeyShareRate: pickFirstValue(invitation, ["proposeJockeyShareRate", "jockeyShareRate"], 0),
    ownerCompensationRate: pickFirstValue(invitation, ["ownerCompensationRate"], 0),
    jockeyCompensationRate: pickFirstValue(invitation, ["jockeyCompensationRate"], 0),
    sentAt: pickFirstValue(invitation, ["sentAt", "createdAt", "createdDate"], ""),
  };
}

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "accepted" || value === "accept") return "Accepted";
  if (value === "rejected" || value === "denied" || value === "deny") return "Rejected";
  if (value === "pending") return "Pending";

  return status || "Pending";
}

function isPending(status) {
  return normalizeStatus(status) === "Pending";
}

function isAccepted(status) {
  return normalizeStatus(status) === "Accepted";
}

export default function JockeyInvitations() {
  const [messageApi, contextHolder] = message.useMessage();
  const [invitations, setInvitations] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [contractLoading, setContractLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadInvitations() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getJockeyInvitations();
      setInvitations(data.map(normalizeInvitation));
    } catch (error) {
      setErrorMessage(error.message || "Could not load invitations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvitations();
  }, []);

  async function handleConfirmResponse() {
    if (!selectedAction) return;

    setSaving(true);

    try {
      await respondToJockeyInvitation(selectedAction.invitation.id, selectedAction.status);
      messageApi.success(
        selectedAction.status === "Accepted" ? "Invitation accepted" : "Invitation declined",
      );
      setSelectedAction(null);
      await loadInvitations();
    } catch (error) {
      messageApi.error(error.message || "Could not update invitation.");
    } finally {
      setSaving(false);
    }
  }

  async function openInvitationDetail(invitation) {
    setDetailLoading(true);

    try {
      const detail = await getJockeyInvitationById(invitation.id);
      setSelectedDetail(normalizeInvitation(detail));
    } catch (error) {
      messageApi.error(error.message || "Could not load invitation detail.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function openInvitationContract(invitation) {
    setContractLoading(true);

    try {
      const contract = await getJockeyInvitationContract(invitation.id);
      setSelectedContract(contract);
    } catch (error) {
      messageApi.error(error.message || "Could not load invitation contract.");
    } finally {
      setContractLoading(false);
    }
  }

  const columns = [
    {
      title: "Invitation",
      dataIndex: "tournament",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">
            {record.owner} invited you to ride {record.horse}
          </Typography.Text>
        </Space>
      ),
    },
    { title: "Location", dataIndex: "location", responsive: ["lg"] },
    {
      title: "Amount",
      dataIndex: "proposeContractAmount",
      render: formatMoney,
      responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => {
        const status = normalizeStatus(value);

        return <Tag color={statusColor[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      width: 320,
      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            loading={detailLoading}
            onClick={() => openInvitationDetail(record)}
          >
            Detail
          </Button>
          <Button
            size="small"
            type="primary"
            disabled={!isPending(record.status)}
            onClick={() => setSelectedAction({ invitation: record, status: "Accepted" })}
          >
            Accept
          </Button>
          <Button
            size="small"
            danger
            disabled={!isPending(record.status)}
            onClick={() => setSelectedAction({ invitation: record, status: "Rejected" })}
          >
            Deny
          </Button>
          <Button
            size="small"
            disabled={!isAccepted(record.status)}
            loading={contractLoading}
            onClick={() => openInvitationContract(record)}
          >
            Contract
          </Button>
        </Space>
      ),
    },
  ];

  const selectedInvitation = selectedAction?.invitation;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {contextHolder}
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Card
        title="Horse owner invitations"
        extra={<Button onClick={loadInvitations}>Refresh</Button>}
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={invitations}
          pagination={{ pageSize: 6, showSizeChanger: false }}
        />
      </Card>

      <Modal
        title={selectedAction?.status === "Accepted" ? "Accept invitation?" : "Deny invitation?"}
        open={Boolean(selectedAction)}
        onCancel={() => setSelectedAction(null)}
        onOk={handleConfirmResponse}
        okText={selectedAction?.status === "Accepted" ? "Accept" : "Deny"}
        okButtonProps={{ danger: selectedAction?.status === "Rejected" }}
        confirmLoading={saving}
        destroyOnHidden
      >
        {selectedInvitation && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Race">{selectedInvitation.race}</Descriptions.Item>
            <Descriptions.Item label="Tournament">{selectedInvitation.tournament}</Descriptions.Item>
            <Descriptions.Item label="Owner">{selectedInvitation.owner}</Descriptions.Item>
            <Descriptions.Item label="Horse">{selectedInvitation.horse}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedInvitation.location}</Descriptions.Item>
            <Descriptions.Item label="Amount">
              {formatMoney(selectedInvitation.proposeContractAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="Owner share">
              {selectedInvitation.proposeOwnerShareRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Jockey share">
              {selectedInvitation.proposeJockeyShareRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Message">{selectedInvitation.message || "N/A"}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Invitation detail"
        open={Boolean(selectedDetail)}
        footer={null}
        onCancel={() => setSelectedDetail(null)}
        destroyOnHidden
      >
        {selectedDetail && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Tournament">{selectedDetail.tournament}</Descriptions.Item>
            <Descriptions.Item label="Owner">{selectedDetail.owner}</Descriptions.Item>
            <Descriptions.Item label="Horse">{selectedDetail.horse}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedDetail.location}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={statusColor[normalizeStatus(selectedDetail.status)] || "default"}>
                {normalizeStatus(selectedDetail.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Contract amount">
              {formatMoney(selectedDetail.proposeContractAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="Owner share">{selectedDetail.proposeOwnerShareRate}%</Descriptions.Item>
            <Descriptions.Item label="Jockey share">{selectedDetail.proposeJockeyShareRate}%</Descriptions.Item>
            <Descriptions.Item label="Owner compensation">
              {selectedDetail.ownerCompensationRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Jockey compensation">
              {selectedDetail.jockeyCompensationRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Message">{selectedDetail.message || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Sent at">{selectedDetail.sentAt || "N/A"}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Invitation contract"
        open={Boolean(selectedContract)}
        footer={null}
        onCancel={() => setSelectedContract(null)}
        destroyOnHidden
      >
        {selectedContract && (
          <Descriptions bordered column={1} size="small">
            {Object.entries(selectedContract).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {typeof value === "object" && value !== null
                  ? JSON.stringify(value)
                  : String(value ?? "N/A")}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>
    </Space>
  );
}
