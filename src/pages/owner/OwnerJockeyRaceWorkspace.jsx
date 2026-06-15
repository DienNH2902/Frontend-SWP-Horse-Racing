import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  confirmHorseRaceEntry,
  confirmJockeyForRace,
  getOwnerJockeyWorkspace,
  registerContractToTournament,
  sendJockeyInvitation,
} from "../../api/services/owner.service";

const contractColor = {
  Active: "green",
  Pending: "gold",
  Rejected: "red",
};

export default function OwnerJockeyRaceWorkspace() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [workspace, setWorkspace] = useState({
    horses: [],
    jockeys: [],
    invitations: [],
    contracts: [],
    schedules: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadWorkspace() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getOwnerJockeyWorkspace();
      setWorkspace(data);
    } catch (error) {
      setErrorMessage(error.message || "Could not load jockey workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, []);

  const horseOptions = useMemo(
    () => workspace.horses.map((horse) => ({ value: horse.id, label: horse.name })),
    [workspace.horses],
  );

  const raceOptions = useMemo(
    () =>
      workspace.schedules.map((race) => ({
        value: race.id,
        label: `${race.race} - ${race.horse}`,
      })),
    [workspace.schedules],
  );

  async function handleInvite(values) {
    setSaving(true);

    try {
      await sendJockeyInvitation(values);
      messageApi.success("Invitation sent to jockey");
      form.resetFields();
      await loadWorkspace();
    } catch (error) {
      messageApi.error(error.message || "Could not send invitation.");
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action, successMessage) {
    try {
      await action();
      messageApi.success(successMessage);
      await loadWorkspace();
    } catch (error) {
      messageApi.error(error.message || "Action failed.");
    }
  }

  const jockeyColumns = [
    {
      title: "Jockey",
      dataIndex: "name",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.specialty}</Typography.Text>
        </Space>
      ),
    },
    { title: "Rating", dataIndex: "rating", responsive: ["md"] },
    {
      title: "Win rate",
      dataIndex: "winRate",
      render: (value) => `${value}%`,
      responsive: ["md"],
    },
    {
      title: "Fee",
      dataIndex: "fee",
      render: (value) => `$${value.toLocaleString()}`,
      responsive: ["lg"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={value === "Available" ? "green" : "default"}>{value}</Tag>,
    },
  ];

  const invitationColumns = [
    { title: "Horse", dataIndex: "horse" },
    { title: "Jockey", dataIndex: "jockey" },
    { title: "Race", dataIndex: "race", responsive: ["md"] },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={contractColor[value] || "blue"}>{value}</Tag>,
    },
  ];

  const contractColumns = [
    { title: "Horse", dataIndex: "horse" },
    { title: "Jockey", dataIndex: "jockey" },
    { title: "Race", dataIndex: "race", responsive: ["md"] },
    {
      title: "Owner confirm",
      dataIndex: "ownerConfirmed",
      render: (value) => <Tag color={value ? "green" : "gold"}>{value ? "Confirmed" : "Waiting"}</Tag>,
    },
    {
      title: "Tournament",
      dataIndex: "tournamentRegistered",
      render: (value) => <Tag color={value ? "green" : "default"}>{value ? "Registered" : "Not yet"}</Tag>,
      responsive: ["lg"],
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            disabled={record.ownerConfirmed}
            onClick={() =>
              runAction(() => confirmJockeyForRace(record.id), "Jockey confirmed for race")
            }
          >
            Confirm jockey
          </Button>
          <Button
            size="small"
            type="primary"
            disabled={!record.ownerConfirmed || record.tournamentRegistered}
            onClick={() =>
              runAction(
                () => registerContractToTournament(record.id),
                "Horse registered to tournament",
              )
            }
          >
            Register tournament
          </Button>
        </Space>
      ),
    },
  ];

  const scheduleColumns = [
    {
      title: "Race",
      dataIndex: "race",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.tournament}</Typography.Text>
        </Space>
      ),
    },
    { title: "Horse", dataIndex: "horse" },
    {
      title: "Time",
      render: (_, record) => `${record.date} ${record.time}`,
      responsive: ["md"],
    },
    { title: "Venue", dataIndex: "venue", responsive: ["lg"] },
    {
      title: "Horse entry",
      dataIndex: "horseConfirmed",
      render: (value) => <Tag color={value ? "green" : "gold"}>{value ? "Confirmed" : "Waiting"}</Tag>,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          size="small"
          disabled={record.horseConfirmed}
          onClick={() =>
            runAction(() => confirmHorseRaceEntry(record.id), "Horse race entry confirmed")
          }
        >
          Confirm horse
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {contextHolder}
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
          <Card title="Invite jockey">
            <Form layout="vertical" form={form} onFinish={handleInvite}>
              <Form.Item
                label="Horse"
                name="horseId"
                rules={[{ required: true, message: "Choose horse" }]}
              >
                <Select options={horseOptions} placeholder="Select horse" />
              </Form.Item>
              <Form.Item
                label="Race schedule"
                name="raceId"
                rules={[{ required: true, message: "Choose race" }]}
              >
                <Select options={raceOptions} placeholder="Select race" />
              </Form.Item>
              <Form.Item
                label="Jockey"
                name="jockeyId"
                rules={[{ required: true, message: "Choose jockey" }]}
              >
                <Select
                  options={workspace.jockeys.map((jockey) => ({
                    value: jockey.id,
                    label: `${jockey.name} - ${jockey.specialty}`,
                  }))}
                  placeholder="Select jockey"
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>
                Send invitation
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={15}>
          <Card title="Available jockeys">
            <Table
              rowKey="id"
              loading={loading}
              columns={jockeyColumns}
              dataSource={workspace.jockeys}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Jockey invitations">
        <Table
          rowKey="id"
          loading={loading}
          columns={invitationColumns}
          dataSource={workspace.invitations}
          pagination={false}
        />
      </Card>

      <Card title="Contracts and tournament registration">
        <Table
          rowKey="id"
          loading={loading}
          columns={contractColumns}
          dataSource={workspace.contracts}
          pagination={false}
        />
      </Card>

      <Card title="Horse race schedule">
        <Table
          rowKey="id"
          loading={loading}
          columns={scheduleColumns}
          dataSource={workspace.schedules}
          pagination={{ pageSize: 5, showSizeChanger: false }}
        />
      </Card>
    </Space>
  );
}
