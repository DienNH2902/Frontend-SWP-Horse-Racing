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
  respondToJockeyInvitation,
} from "../../api/services/jockey.service";

const statusColor = {
  Pending: "gold",
  Accepted: "green",
  Rejected: "red",
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export default function JockeyInvitations() {
  const [messageApi, contextHolder] = message.useMessage();
  const [invitations, setInvitations] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadInvitations() {
    setLoading(true);
    setErrorMessage("");

    try {
      setInvitations(await getJockeyInvitations());
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

  const columns = [
    {
      title: "Invitation",
      dataIndex: "race",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">
            {record.owner} invited you to ride {record.horse}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Race time",
      render: (_, record) => `${record.date} ${record.time}`,
      responsive: ["md"],
    },
    { title: "Venue", dataIndex: "venue", responsive: ["lg"] },
    {
      title: "Fee",
      dataIndex: "fee",
      render: formatMoney,
      responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={statusColor[value] || "default"}>{value}</Tag>,
    },
    {
      title: "Action",
      width: 210,
      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            type="primary"
            disabled={record.status !== "Pending"}
            onClick={() => setSelectedAction({ invitation: record, status: "Accepted" })}
          >
            Accept
          </Button>
          <Button
            size="small"
            danger
            disabled={record.status !== "Pending"}
            onClick={() => setSelectedAction({ invitation: record, status: "Rejected" })}
          >
            Deny
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
            <Descriptions.Item label="Time">
              {selectedInvitation.date} {selectedInvitation.time}
            </Descriptions.Item>
            <Descriptions.Item label="Venue">{selectedInvitation.venue}</Descriptions.Item>
            <Descriptions.Item label="Distance">{selectedInvitation.distance}</Descriptions.Item>
            <Descriptions.Item label="Surface">{selectedInvitation.surface}</Descriptions.Item>
            <Descriptions.Item label="Fee">{formatMoney(selectedInvitation.fee)}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Space>
  );
}
