import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
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

function pickFirstValue(source, keys, fallback = "") {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
}

function collectionFrom(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.licenses)) return value.licenses;
  if (Array.isArray(value?.license)) return value.license;

  return [];
}

function normalizeHorse(horse) {
  return {
    ...horse,
    id: pickFirstValue(horse, ["id", "_id", "horseId"]),
    name: pickFirstValue(horse, ["name", "horseName"], "Unnamed horse"),
  };
}

function normalizeJockey(jockey) {
  const profile = jockey?.jockeyProfile || jockey?.profile || {};
  const licenses = collectionFrom(
    pickFirstValue(jockey, ["license", "licenses"], null) ||
      pickFirstValue(profile, ["license", "licenses"], []),
  );

  return {
    ...jockey,
    id: pickFirstValue(jockey, ["id", "_id", "userId"], pickFirstValue(profile, ["id", "_id"])),
    fullName: pickFirstValue(jockey, ["fullName", "name"], "Unnamed jockey"),
    email: pickFirstValue(jockey, ["email"], "N/A"),
    phoneNumber: pickFirstValue(jockey, ["phoneNumber", "phone"], "N/A"),
    avatar: pickFirstValue(jockey, ["avatar", "avatarUrl", "imageUrl"], ""),
    weight: pickFirstValue(jockey, ["weight"], pickFirstValue(profile, ["weight"], "N/A")),
    height: pickFirstValue(jockey, ["height"], pickFirstValue(profile, ["height"], "N/A")),
    winRate: pickFirstValue(jockey, ["winRate"], pickFirstValue(profile, ["winRate"], 0)),
    jockeyStatus: pickFirstValue(jockey, ["jockeyStatus"], "Available"),
    licenses,
  };
}

function formatRate(value) {
  if (value === undefined || value === null || value === "") return "0%";
  return String(value).includes("%") ? value : `${value}%`;
}

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
  const [licenseJockey, setLicenseJockey] = useState(null);

  async function loadWorkspace() {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getOwnerJockeyWorkspace();
      setWorkspace({
        ...data,
        horses: (data.horses || []).map(normalizeHorse),
        jockeys: (data.jockeys || []).map(normalizeJockey),
      });
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
      dataIndex: "fullName",
      render: (value, record) => (
        <Space>
          <Avatar src={record.avatar}>{String(value).charAt(0)}</Avatar>
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{value}</Typography.Text>
            <Typography.Text type="secondary">{record.email}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    { title: "Phone", dataIndex: "phoneNumber", responsive: ["lg"] },
    { title: "Weight", dataIndex: "weight", responsive: ["md"] },
    { title: "Height", dataIndex: "height", responsive: ["md"] },
    {
      title: "Win rate",
      dataIndex: "winRate",
      render: formatRate,
      responsive: ["md"],
    },
    {
      title: "License",
      dataIndex: "licenses",
      render: (licenses, record) => (
        <Button
          size="small"
          disabled={!licenses?.length}
          onClick={() => setLicenseJockey(record)}
        >
          View more
        </Button>
      ),
      responsive: ["lg"],
    },
    {
      title: "Status",
      dataIndex: "jockeyStatus",
      render: (value) => <Tag color={value === "Available" ? "green" : "default"}>{value}</Tag>,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button size="small" type="primary" onClick={() => form.setFieldValue("jockeyId", record.id)}>
          Invite
        </Button>
      ),
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
            <Form
              layout="vertical"
              form={form}
              onFinish={handleInvite}
              initialValues={{
                proposeContractAmount: 5000000,
                proposeOwnerShareRate: 60,
                proposeJockeyShareRate: 40,
                ownerCompensationRate: 60,
                jockeyCompensationRate: 40,
                message: "Mời bạn tham gia giải đua tháng 6",
              }}
            >
              <Form.Item
                label="Tournament ID"
                name="tournamentId"
                rules={[{ required: true, message: "Enter tournament id" }]}
              >
                <Input placeholder="6650a1b2c3d4e5f6a7b8c9d0" />
              </Form.Item>
              <Form.Item
                label="Horse"
                name="horseId"
                rules={[{ required: true, message: "Choose horse" }]}
              >
                <Select options={horseOptions} placeholder="Select horse" />
              </Form.Item>
              <Form.Item
                label="Jockey"
                name="jockeyId"
                rules={[{ required: true, message: "Choose jockey" }]}
              >
                <Select
                  options={workspace.jockeys.map((jockey) => ({
                    value: jockey.id,
                    label: `${jockey.fullName} - ${jockey.email}`,
                  }))}
                  placeholder="Select jockey"
                />
              </Form.Item>
              <Form.Item
                label="Contract amount"
                name="proposeContractAmount"
                rules={[{ required: true, message: "Enter contract amount" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Owner share"
                    name="proposeOwnerShareRate"
                    rules={[{ required: true, message: "Enter owner share" }]}
                  >
                    <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Jockey share"
                    name="proposeJockeyShareRate"
                    rules={[{ required: true, message: "Enter jockey share" }]}
                  >
                    <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Owner compensation"
                    name="ownerCompensationRate"
                    rules={[{ required: true, message: "Enter owner compensation" }]}
                  >
                    <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Jockey compensation"
                    name="jockeyCompensationRate"
                    rules={[{ required: true, message: "Enter jockey compensation" }]}
                  >
                    <InputNumber min={0} max={100} addonAfter="%" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Message" name="message">
                <Input.TextArea rows={3} placeholder="Mời bạn tham gia giải đua tháng 6" />
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

      <Modal
        open={Boolean(licenseJockey)}
        title={`Licenses - ${licenseJockey?.fullName || ""}`}
        footer={null}
        onCancel={() => setLicenseJockey(null)}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {(licenseJockey?.licenses || []).map((license, index) => (
            <Descriptions
              key={pickFirstValue(license, ["_id", "id", "licenseCode"], index)}
              bordered
              size="small"
              column={1}
            >
              <Descriptions.Item label="Code">
                {pickFirstValue(license, ["licenseCode"], "N/A")}
              </Descriptions.Item>
              <Descriptions.Item label="Racing start date">
                {pickFirstValue(license, ["racingStartDate"], "N/A")}
              </Descriptions.Item>
              <Descriptions.Item label="Certificate">
                {pickFirstValue(license, ["licenseUrl"], "") ? (
                  <Typography.Link
                    href={pickFirstValue(license, ["licenseUrl"], "")}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </Typography.Link>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>
            </Descriptions>
          ))}
        </Space>
      </Modal>
    </Space>
  );
}
