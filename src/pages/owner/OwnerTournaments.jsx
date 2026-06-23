import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { getSentJockeyInvitations } from "../../api/services/owner.service";
import { createRegistration } from "../../api/services/registration.service";
import { getTournamentById, getTournaments } from "../../api/services/tournament.service";

function pickFirstValue(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
}

function normalizeTournament(tournament = {}) {
  return {
    ...tournament,
    id: pickFirstValue(tournament, ["id", "_id", "tournamentId"]),
    title: pickFirstValue(tournament, ["title", "name"], "Unnamed tournament"),
    description: pickFirstValue(tournament, ["description"], ""),
    imageUrl: pickFirstValue(tournament, ["imageUrl", "image"], ""),
    startDate: pickFirstValue(tournament, ["startDate"], "N/A"),
    endDate: pickFirstValue(tournament, ["endDate"], "N/A"),
    location: pickFirstValue(tournament, ["location"], "N/A"),
    status: pickFirstValue(tournament, ["status"], "N/A"),
    totalRounds: pickFirstValue(tournament, ["totalRounds"], 0),
    horsesPerRace: pickFirstValue(tournament, ["horsesPerRace"], 0),
    totalRaces: pickFirstValue(tournament, ["totalRaces"], 0),
    entryFee: pickFirstValue(tournament, ["entryFee"], 0),
    availableSlot: pickFirstValue(tournament, ["availableSlot"], 0),
  };
}

function normalizeInvitation(invitation = {}) {
  const horse = invitation.horse || invitation.horseInfo || {};
  const jockey = invitation.jockey || invitation.jockeyInfo || {};
  const tournament = invitation.tournament || invitation.tournamentInfo || {};
  const tournamentId = pickFirstValue(
    invitation,
    ["tournamentId"],
    pickFirstValue(tournament, ["id", "_id", "tournamentId"], ""),
  );

  return {
    ...invitation,
    id: pickFirstValue(invitation, ["id", "_id", "invitationId"]),
    tournamentId,
    horse: pickFirstValue(invitation, ["horseName"], pickFirstValue(horse, ["name", "horseName"], "N/A")),
    jockey: pickFirstValue(
      invitation,
      ["jockeyName", "jockeyFullName"],
      pickFirstValue(jockey, ["fullName", "name"], "N/A"),
    ),
    tournament: pickFirstValue(
      invitation,
      ["tournamentTitle", "tournamentName"],
      pickFirstValue(tournament, ["title", "name"], "N/A"),
    ),
    status: pickFirstValue(invitation, ["status", "invitationStatus"], "Pending"),
  };
}

async function resolveInvitationTournamentTitles(invitations) {
  const tournamentCache = new Map();

  return Promise.all(
    invitations.map(async (invitation) => {
      if (invitation.tournament !== "N/A" || !invitation.tournamentId) {
        return invitation;
      }

      try {
        if (!tournamentCache.has(invitation.tournamentId)) {
          tournamentCache.set(invitation.tournamentId, getTournamentById(invitation.tournamentId));
        }

        const tournament = normalizeTournament(await tournamentCache.get(invitation.tournamentId));

        return {
          ...invitation,
          tournament: tournament.title,
        };
      } catch {
        return invitation;
      }
    }),
  );
}

function isAcceptedInvitation(invitation) {
  const status = String(invitation?.status || "").toLowerCase();

  return status === "accepted" || status === "accept";
}

function statusColor(status) {
  const value = String(status || "").toLowerCase();

  if (value.includes("preparing")) return "gold";
  if (value.includes("open") || value.includes("active")) return "green";
  if (value.includes("running")) return "blue";
  if (value.includes("finished") || value.includes("completed")) return "default";
  if (value.includes("cancel")) return "red";

  return "default";
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export default function OwnerTournaments() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [tournaments, setTournaments] = useState([]);
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [invitationErrorMessage, setInvitationErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    getTournaments()
      .then((data) => setTournaments(data.map(normalizeTournament)))
      .catch((error) => {
        setTournaments([]);
        setErrorMessage(error.message || "Could not load tournaments.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function loadAcceptedInvitations() {
    setInvitationLoading(true);
    setInvitationErrorMessage("");

    try {
      const invitations = await getSentJockeyInvitations();
      const accepted = invitations.map(normalizeInvitation).filter(isAcceptedInvitation);
      const resolved = await resolveInvitationTournamentTitles(accepted);

      setAcceptedInvitations(resolved);
    } catch (error) {
      setAcceptedInvitations([]);
      setInvitationErrorMessage(error.message || "Could not load accepted invitations.");
    } finally {
      setInvitationLoading(false);
    }
  }

  useEffect(() => {
    loadAcceptedInvitations();
  }, []);

  async function handleRegister(values) {
    setSaving(true);

    try {
      await createRegistration({
        jockeyInvitationId: values.jockeyInvitationId,
      });
      messageApi.success("Tournament registration submitted");
      form.resetFields();
    } catch (error) {
      messageApi.error(error.message || "Could not submit registration.");
    } finally {
      setSaving(false);
    }
  }

  const stats = useMemo(() => {
    const total = tournaments.length;
    const preparing = tournaments.filter(
      (item) => String(item.status).toLowerCase() === "preparing",
    ).length;
    const availableSlots = tournaments.reduce(
      (sum, item) => sum + Number(item.availableSlot || 0),
      0,
    );
    const totalRaces = tournaments.reduce(
      (sum, item) => sum + Number(item.totalRaces || 0),
      0,
    );

    return { total, preparing, availableSlots, totalRaces };
  }, [tournaments]);

  const columns = [
    {
      title: "Tournament",
      dataIndex: "title",
      render: (value, record) => (
        <Space>
          <Avatar shape="square" size={48} src={record.imageUrl}>
            {String(value || "?").charAt(0)}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{value}</Typography.Text>
            <Typography.Text type="secondary">{record.location}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Date",
      render: (_, record) => `${record.startDate} - ${record.endDate}`,
      responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={statusColor(value)}>{value}</Tag>,
    },
    { title: "Rounds", dataIndex: "totalRounds", responsive: ["lg"] },
    { title: "Races", dataIndex: "totalRaces", responsive: ["md"] },
    { title: "Horses/race", dataIndex: "horsesPerRace", responsive: ["lg"] },
    { title: "Slots", dataIndex: "availableSlot" },
    {
      title: "Entry fee",
      dataIndex: "entryFee",
      render: (value) => `${formatMoney(value)} VND`,
      responsive: ["lg"],
    },
  ];

  const invitationOptions = useMemo(
    () =>
      acceptedInvitations.map((invitation) => ({
        value: invitation.id,
        label: `${invitation.tournament} - ${invitation.horse} / ${invitation.jockey}`,
      })),
    [acceptedInvitations],
  );

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {contextHolder}
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}
      {invitationErrorMessage && (
        <Alert type="warning" showIcon message={invitationErrorMessage} />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Tournaments" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Preparing" value={stats.preparing} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Available slots" value={stats.availableSlots} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Total races" value={stats.totalRaces} />
          </Card>
        </Col>
      </Row>

      <Card title="Register tournament entry">
        <Form layout="vertical" form={form} onFinish={handleRegister}>
          <Form.Item
            label="Accepted jockey invitation"
            name="jockeyInvitationId"
            rules={[{ required: true, message: "Choose an accepted invitation" }]}
          >
            <Select
              loading={invitationLoading}
              options={invitationOptions}
              placeholder="Select accepted invitation"
              showSearch
              optionFilterProp="label"
              notFoundContent={
                invitationLoading ? "Loading invitations..." : "No accepted invitations found"
              }
            />
          </Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit" loading={saving}>
              Register
            </Button>
            <Button onClick={loadAcceptedInvitations} loading={invitationLoading}>
              Refresh invitations
            </Button>
          </Space>
        </Form>
      </Card>

      <Card title="Tournaments">
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : tournaments.length === 0 ? (
          <Empty description="No tournaments found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={tournaments}
            pagination={{ pageSize: 8, showSizeChanger: false }}
          />
        )}
      </Card>
    </Space>
  );
}
