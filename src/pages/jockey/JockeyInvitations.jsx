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
import { getTournamentById } from "../../api/services/tournament.service";
import { getUserById } from "../../api/services/user.service";

const statusColor = {
  Pending: "gold",
  Accepted: "green",
  Rejected: "red",
};

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} VND`;
}

function formatContractDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

function pickFirstValue(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
}

function getReferenceId(reference) {
  if (!reference) return "";
  if (typeof reference === "string") return reference;

  return pickFirstValue(reference, ["id", "_id", "userId"], "");
}

function unwrapUser(response) {
  return (
    response?.data?.data ||
    response?.data ||
    response?.result ||
    response?.user ||
    response
  );
}

function normalizeInvitation(invitation = {}) {
  const ownerReference =
    invitation.owner ||
    invitation.ownerInfo ||
    invitation.horseOwner ||
    invitation.horseOwnerInfo ||
    invitation.ownerId ||
    invitation.horseOwnerId ||
    {};
  const owner =
    typeof ownerReference === "object" ? ownerReference : {};
  const horse = invitation.horse || invitation.horseInfo || {};
  const tournamentReference =
    invitation.tournament ||
    invitation.tournamentInfo ||
    invitation.tournamentId ||
    {};
  const tournament =
    typeof tournamentReference === "object" ? tournamentReference : {};

  return {
    ...invitation,
    id: pickFirstValue(invitation, ["id", "_id", "invitationId"]),
    ownerId:
      getReferenceId(ownerReference) ||
      pickFirstValue(invitation, ["ownerId", "horseOwnerId"], ""),
    tournamentId:
      getReferenceId(tournamentReference) ||
      pickFirstValue(invitation, ["tournamentId"], ""),
    owner: pickFirstValue(
      invitation,
      ["ownerName", "horseOwnerName", "ownerFullName", "horseOwnerFullName"],
      pickFirstValue(owner, ["fullName", "name", "displayName"], "N/A"),
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

async function resolveInvitationTournamentData(invitations) {
  const tournamentCache = new Map();

  return Promise.all(
    invitations.map(async (invitation) => {
      const needsTournament =
        invitation.tournament === "N/A" || invitation.location === "N/A";

      if (!needsTournament || !invitation.tournamentId) {
        return invitation;
      }

      try {
        if (!tournamentCache.has(invitation.tournamentId)) {
          tournamentCache.set(
            invitation.tournamentId,
            getTournamentById(invitation.tournamentId),
          );
        }

        const tournament = await tournamentCache.get(invitation.tournamentId);

        return {
          ...invitation,
          tournament:
            invitation.tournament !== "N/A"
              ? invitation.tournament
              : pickFirstValue(tournament, ["title", "name"], "N/A"),
          location:
            invitation.location !== "N/A"
              ? invitation.location
              : pickFirstValue(tournament, ["location", "venue"], "N/A"),
        };
      } catch {
        return invitation;
      }
    }),
  );
}

async function resolveInvitationOwnerNames(invitations) {
  const ownerCache = new Map();

  return Promise.all(
    invitations.map(async (invitation) => {
      if (invitation.owner !== "N/A" || !invitation.ownerId) {
        return invitation;
      }

      try {
        if (!ownerCache.has(invitation.ownerId)) {
          ownerCache.set(invitation.ownerId, getUserById(invitation.ownerId));
        }

        const owner = unwrapUser(await ownerCache.get(invitation.ownerId));

        return {
          ...invitation,
          owner: pickFirstValue(
            owner,
            ["fullName", "name", "displayName", "email"],
            "N/A",
          ),
        };
      } catch {
        return invitation;
      }
    }),
  );
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
      const normalized = data.map(normalizeInvitation);
      const withOwners = await resolveInvitationOwnerNames(normalized);
      setInvitations(await resolveInvitationTournamentData(withOwners));
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
      const detailsWithOwners = await resolveInvitationOwnerNames([
        normalizeInvitation(detail),
      ]);
      const [resolvedDetail] =
        await resolveInvitationTournamentData(detailsWithOwners);
      setSelectedDetail(resolvedDetail);
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
      let jockeyName = "Jockey";

      if (contract?.jockeyId) {
        try {
          const jockey = unwrapUser(await getUserById(contract.jockeyId));
          jockeyName = pickFirstValue(
            jockey,
            ["fullName", "name", "displayName", "email"],
            jockeyName,
          );
        } catch {
          // The contract remains usable even if the user lookup fails.
        }
      }

      setSelectedContract({
        ...contract,
        ownerName: invitation.owner,
        jockeyName,
        horseName: invitation.horse,
        tournamentName: invitation.tournament,
      });
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
          <Typography.Text strong>{record.owner}</Typography.Text>
          <Typography.Text type="secondary">
            {record.message}
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
        title={null}
        open={Boolean(selectedContract)}
        footer={null}
        onCancel={() => setSelectedContract(null)}
        destroyOnHidden
        width={760}
      >
        {selectedContract && (
          <div
            style={{
              overflow: "hidden",
              border: "1px solid #ccefe7",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <div
              style={{
                padding: "28px 30px",
                color: "#fff",
                background: "linear-gradient(135deg, #06332e, #087a6d)",
                textAlign: "center",
              }}
            >
              <Typography.Text
                style={{
                  color: "#69f8dd",
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 2,
                }}
              >
                GOLDENHOOF OFFICIAL AGREEMENT
              </Typography.Text>
              <Typography.Title
                level={2}
                style={{ margin: "8px 0 12px", color: "#fff" }}
              >
                Jockey Service Contract
              </Typography.Title>
              <Tag color={selectedContract.status === "ACTIVE" ? "green" : "default"}>
                {selectedContract.status || "N/A"}
              </Tag>
            </div>

            <div style={{ padding: 28 }}>
              <Typography.Title level={5}>Contract parties</Typography.Title>
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Horse Owner">
                  <Typography.Text strong>
                    {selectedContract.ownerName || "N/A"}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Jockey">
                  <Typography.Text strong>
                    {selectedContract.jockeyName || "N/A"}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Horse">
                  {selectedContract.horseName || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tournament">
                  {selectedContract.tournamentName || "N/A"}
                </Descriptions.Item>
              </Descriptions>

              <Typography.Title level={5} style={{ marginTop: 24 }}>
                Financial terms
              </Typography.Title>
              <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                <Descriptions.Item label="Contract Amount" span={2}>
                  <Typography.Text strong style={{ color: "#087a6d", fontSize: 18 }}>
                    {formatMoney(selectedContract.contractAmount)}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Owner Share">
                  {selectedContract.ownerShareRate ?? 0}%
                </Descriptions.Item>
                <Descriptions.Item label="Jockey Share">
                  {selectedContract.jockeyShareRate ?? 0}%
                </Descriptions.Item>
                <Descriptions.Item label="Owner Compensation">
                  {selectedContract.ownerCompensationRate ?? 0}%
                </Descriptions.Item>
                <Descriptions.Item label="Jockey Compensation">
                  {selectedContract.jockeyCompensationRate ?? 0}%
                </Descriptions.Item>
              </Descriptions>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: "1px solid #d9eee9",
                  color: "#52726e",
                  fontSize: 13,
                }}
              >
                <span>Signed: {formatContractDate(selectedContract.signedAt)}</span>
                <span>Contract ID: {selectedContract._id || "N/A"}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Space>
  );
}
