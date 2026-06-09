import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Col, Empty, Row, Skeleton, Space, Statistic, Table, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
const mockRaces = [
  {
    id: 1,
    code: "RC001",
    name: "Golden Cup",
    track: "Track A",
    time: "09:00",
    status: "Live",
    entrants: [1, 2, 3],
  },
];

const mockHorses = [
  { id: 1, name: "Thunder" },
  { id: 2, name: "Storm" },
];

const mockOwners = [
  { id: 1, name: "Owner A" },
  { id: 2, name: "Owner B" },
];

function statusColor(status) {
  const value = String(status || "").toLowerCase();

  if (value.includes("live")) return "red";
  if (value.includes("finished") || value.includes("official")) return "green";
  if (value.includes("cancel")) return "default";
  return "blue";
}

function collectionFrom(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

export default function RefereeDashboard() {
  const [races, setRaces] = useState([]);
  const [horses, setHorses] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErrorMessage("");

      setRaces(mockRaces);
      setHorses(mockHorses);
      setOwners(mockOwners);
      setLoading(false);

      if (!mounted) return;

      if (raceResult.status === "fulfilled") setRaces(raceResult.value);
      if (horseResult.status === "fulfilled") setHorses(collectionFrom(horseResult.value));
      if (ownerResult.status === "fulfilled") setOwners(collectionFrom(ownerResult.value));

      const rejected = [raceResult, horseResult, ownerResult].find(
        (result) => result.status === "rejected",
      );
      if (rejected) {
        setErrorMessage(rejected.reason?.message || "Some referee dashboard data could not be loaded.");
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const live = races.filter((race) => String(race.status).toLowerCase().includes("live")).length;
    const waitingResult = races.filter((race) => {
      const status = String(race.status).toLowerCase();
      return status.includes("live") || status.includes("scheduled");
    }).length;
    const finished = races.filter((race) => String(race.status).toLowerCase().includes("finished")).length;

    return { live, waitingResult, finished };
  }, [races]);

  const nextRaces = useMemo(() => races.slice(0, 5), [races]);

  const columns = [
    {
      title: "Race",
      dataIndex: "name",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Link to={`/referee/races/${record.id}`}>{value}</Link>
          <Typography.Text type="secondary">{record.code}</Typography.Text>
        </Space>
      ),
    },
    { title: "Track", dataIndex: "track", responsive: ["md"] },
    { title: "Time", dataIndex: "time" },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={statusColor(value)}>{value}</Tag>,
    },
    {
      title: "Entrants",
      dataIndex: "entrants",
      render: (value) => value?.length || 0,
      responsive: ["lg"],
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Races assigned" value={races.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Live races" value={stats.live} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Awaiting result" value={stats.waitingResult} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Registered horses" value={horses.length} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="Live and upcoming races" extra={<Link to="/referee/races">View all</Link>}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : nextRaces.length === 0 ? (
              <Empty description="No races available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={nextRaces}
                pagination={false}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="Referee workload">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Statistic title="Finished races" value={stats.finished} />
              <Statistic title="Horse owners" value={owners.length} />
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Open a race to review entrants and submit the official result.
              </Typography.Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
