import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Empty, Row, Skeleton, Space, Statistic, Table, Tag, Typography } from "antd";
import { Link } from "react-router-dom";
import { getMyHorses } from "../../api/services/horse.service";
import { getHorseStatusColor, horseCollectionFrom, isActiveHorse, normalizeHorse } from "./horseViewModel";

export default function OwnerDashboard() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getMyHorses()
      .then((data) => setHorses(horseCollectionFrom(data)))
      .catch((error) => setErrorMessage(error.message || "Could not load owner dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => horses.map(normalizeHorse), [horses]);

  const stats = useMemo(() => {
    const total = rows.length;
    const active = rows.filter(isActiveHorse).length;
    const totalWins = rows.reduce((sum, horse) => sum + horse.totalWin, 0);
    const averageWinRate =
      total > 0 ? Math.round(rows.reduce((sum, horse) => sum + horse.winRate, 0) / total) : 0;

    return { total, active, totalWins, averageWinRate };
  }, [rows]);

  const latestRows = useMemo(() => rows.slice(0, 5), [rows]);

  const columns = [
    {
      title: "Horse",
      dataIndex: "name",
      render: (value) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.breed}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={getHorseStatusColor(value)}>{value}</Tag>,
    },
    { title: "Wins", dataIndex: "totalWin", responsive: ["md"] },
    {
      title: "Win rate",
      dataIndex: "winRate",
      render: (value) => `${value || 0}%`,
    },
  ];

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="My horses" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Active horses" value={stats.active} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Total wins" value={stats.totalWins} />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic title="Average win rate" value={stats.averageWinRate} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card
        title="Stable overview"
        extra={
          <Space wrap>
            <Link to="/owner/horses">
              <Button>Manage horses</Button>
            </Link>
            <Link to="/owner/horses/register">
              <Button type="primary">Register horse</Button>
            </Link>
          </Space>
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : rows.length === 0 ? (
          <Empty
            description="No horses found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Link to="/owner/horses/register">
              <Button type="primary">Register your first horse</Button>
            </Link>
          </Empty>
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={latestRows}
            pagination={false}
          />
        )}
      </Card>

      <Row gutter={[16, 16]}>
        {rows.slice(0, 3).map((horse) => (
          <Col key={horse.id} xs={24} md={8}>
            <Card
              hoverable
              title={horse.name}
              extra={<Tag color={getHorseStatusColor(horse.status)}>{horse.status}</Tag>}
            >
              <Space direction="vertical" size={6}>
                <Typography.Text>Owner: {horse.ownerName}</Typography.Text>
                <Typography.Text>Wins: {horse.totalWin}</Typography.Text>
                <Typography.Text>Rating: {horse.rating}</Typography.Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
