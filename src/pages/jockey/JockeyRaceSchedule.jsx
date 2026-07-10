import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { getProfile } from "../../api/services/auth.service";
import { getJockeyRaceSchedule } from "../../api/services/jockey.service";
import RaceHistoryCard from "../../components/races/RaceHistoryCard";

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export default function JockeyRaceSchedule() {
  const [data, setData] = useState({ schedules: [], standings: [] });
  const [profile, setProfile] = useState({});
  const [selectedRace, setSelectedRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    Promise.all([getJockeyRaceSchedule(), getProfile()])
      .then(([scheduleData, profileData]) => {
        setData(scheduleData);
        setProfile(profileData || {});
      })
      .catch((error) => setErrorMessage(error.message || "Could not load race schedule."))
      .finally(() => setLoading(false));
  }, []);

  const finishedRaces = data.schedules.filter((race) => race.result);
  const totalPrize = finishedRaces.reduce((sum, race) => sum + (race.result?.prize || 0), 0);
  const bestRank = useMemo(() => {
    const ranks = finishedRaces.map((race) => race.result?.rank || 99);
    return ranks.length ? Math.min(...ranks) : null;
  }, [finishedRaces]);

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
      title: "Status",
      dataIndex: "assignmentStatus",
      render: (value) => <Tag color={value === "Finished" ? "green" : "blue"}>{value}</Tag>,
    },
    {
      title: "Result",
      render: (_, record) =>
        record.result ? `#${record.result.rank} - ${record.result.time}` : "Upcoming",
      responsive: ["md"],
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button size="small" onClick={() => setSelectedRace(record)}>
          View detail
        </Button>
      ),
    },
  ];

  const standingColumns = [
    { title: "#", dataIndex: "rank", width: 70 },
    {
      title: "Jockey",
      dataIndex: "jockey",
      render: (value) => <Typography.Text strong={value === "Demo Jockey"}>{value}</Typography.Text>,
    },
    { title: "Wins", dataIndex: "wins", responsive: ["md"] },
    { title: "Points", dataIndex: "points" },
    {
      title: "Prize",
      dataIndex: "prize",
      render: formatMoney,
      responsive: ["lg"],
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Assigned races" value={data.schedules.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Best finish" value={bestRank ? `#${bestRank}` : "-"} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Prize earned" value={totalPrize} prefix="$" />
          </Card>
        </Col>
      </Row>

      <Card title="My upcoming race schedule">
        <Table
          rowKey="id"
          loading={loading}
          columns={scheduleColumns}
          dataSource={data.schedules}
          pagination={{ pageSize: 6, showSizeChanger: false }}
        />
      </Card>

      <Card title="Personal ranking">
        <Table
          rowKey={(record) => `${record.rank}-${record.jockey}`}
          loading={loading}
          columns={standingColumns}
          dataSource={data.standings}
          pagination={false}
          rowClassName={(record) => (record.jockey === "Demo Jockey" ? "jockey-highlight-row" : "")}
        />
      </Card>

      <RaceHistoryCard
        history={profile.historyRaceJockey}
        loading={loading}
        participantLabel="Owner"
      />

      <Modal
        title={selectedRace ? selectedRace.race : "Race detail"}
        open={Boolean(selectedRace)}
        onCancel={() => setSelectedRace(null)}
        footer={<Button onClick={() => setSelectedRace(null)}>Close</Button>}
        width={760}
        destroyOnHidden
      >
        {selectedRace ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Tournament">{selectedRace.tournament}</Descriptions.Item>
            <Descriptions.Item label="Date">{selectedRace.date}</Descriptions.Item>
            <Descriptions.Item label="Time">{selectedRace.time}</Descriptions.Item>
            <Descriptions.Item label="Venue">{selectedRace.venue}</Descriptions.Item>
            <Descriptions.Item label="Gate">{selectedRace.gate}</Descriptions.Item>
            <Descriptions.Item label="Distance">{selectedRace.distance}</Descriptions.Item>
            <Descriptions.Item label="Surface">{selectedRace.surface}</Descriptions.Item>
            <Descriptions.Item label="Purse">{formatMoney(selectedRace.purse)}</Descriptions.Item>
            <Descriptions.Item label="Horse">{selectedRace.horse}</Descriptions.Item>
            <Descriptions.Item label="Owner">{selectedRace.owner}</Descriptions.Item>
            <Descriptions.Item label="Horse profile">
              {selectedRace.horseInfo.breed}, {selectedRace.horseInfo.age} yrs, rating{" "}
              {selectedRace.horseInfo.rating}, win rate {selectedRace.horseInfo.winRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Horse record">
              {selectedRace.horseInfo.starts} starts, {selectedRace.horseInfo.podiums} podiums
            </Descriptions.Item>
            <Descriptions.Item label="Result">
              {selectedRace.result
                ? `Rank #${selectedRace.result.rank}, ${selectedRace.result.time}, ${formatMoney(
                    selectedRace.result.prize,
                  )}, ${selectedRace.result.points} points`
                : "Waiting for race day"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select a race" />
        )}
      </Modal>

      <style>{`
        .jockey-highlight-row td {
          background: #effffb !important;
        }
      `}</style>
    </Space>
  );
}
