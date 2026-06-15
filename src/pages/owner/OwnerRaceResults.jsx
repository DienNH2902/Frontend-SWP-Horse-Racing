import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Col, Descriptions, Empty, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import { getOwnerRaceCenter } from "../../api/services/owner.service";

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export default function OwnerRaceResults() {
  const [data, setData] = useState({ races: [], standings: [] });
  const [selectedRaceId, setSelectedRaceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    getOwnerRaceCenter()
      .then((result) => {
        if (!mounted) return;
        setData(result);
        setSelectedRaceId(result.races[0]?.id || null);
      })
      .catch((error) => {
        if (mounted) {
          setErrorMessage(error.message || "Could not load race information.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedRace = useMemo(
    () => data.races.find((race) => race.id === selectedRaceId),
    [data.races, selectedRaceId],
  );

  const finishedRaces = data.races.filter((race) => race.status === "Finished");
  const totalPrize = finishedRaces.reduce((sum, race) => sum + (race.result?.prize || 0), 0);
  const bestRank = Math.min(...finishedRaces.map((race) => race.result?.rank || 99));

  const raceColumns = [
    {
      title: "Race",
      dataIndex: "name",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Link onClick={() => setSelectedRaceId(record.id)}>{value}</Typography.Link>
          <Typography.Text type="secondary">{record.tournament}</Typography.Text>
        </Space>
      ),
    },
    { title: "Horse", dataIndex: "myHorse" },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={value === "Finished" ? "green" : "blue"}>{value}</Tag>,
    },
    {
      title: "Result",
      render: (_, record) =>
        record.result ? `#${record.result.rank} - ${record.result.time}` : "Upcoming",
      responsive: ["md"],
    },
    {
      title: "Prize",
      render: (_, record) => formatMoney(record.result?.prize),
      responsive: ["lg"],
    },
  ];

  const standingColumns = [
    { title: "#", dataIndex: "rank", width: 70 },
    {
      title: "Horse",
      dataIndex: "horse",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong={record.owner === "Golden Hoof Stable"}>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.owner}</Typography.Text>
        </Space>
      ),
    },
    { title: "Wins", dataIndex: "wins", responsive: ["md"] },
    { title: "Points", dataIndex: "points" },
    {
      title: "Prize money",
      dataIndex: "prize",
      render: formatMoney,
      responsive: ["lg"],
    },
  ];

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Races tracked" value={data.races.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Best finish" value={Number.isFinite(bestRank) ? `#${bestRank}` : "-"} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Prize earned" value={totalPrize} prefix="$" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card title="Race information and results">
            <Table
              rowKey="id"
              loading={loading}
              columns={raceColumns}
              dataSource={data.races}
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card title="Selected race">
            {selectedRace ? (
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Race">{selectedRace.name}</Descriptions.Item>
                <Descriptions.Item label="Tournament">{selectedRace.tournament}</Descriptions.Item>
                <Descriptions.Item label="Venue">{selectedRace.venue}</Descriptions.Item>
                <Descriptions.Item label="Time">
                  {selectedRace.date} {selectedRace.time}
                </Descriptions.Item>
                <Descriptions.Item label="Distance">{selectedRace.distance}</Descriptions.Item>
                <Descriptions.Item label="Surface">{selectedRace.surface}</Descriptions.Item>
                <Descriptions.Item label="Horse">{selectedRace.myHorse}</Descriptions.Item>
                <Descriptions.Item label="Jockey">{selectedRace.jockey}</Descriptions.Item>
                <Descriptions.Item label="Purse">{formatMoney(selectedRace.purse)}</Descriptions.Item>
                <Descriptions.Item label="Result">
                  {selectedRace.result
                    ? `Rank #${selectedRace.result.rank}, ${selectedRace.result.points} points, ${formatMoney(
                        selectedRace.result.prize,
                      )}`
                    : "Waiting for race day"}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Select a race" />
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Leaderboard and prize money">
        <Table
          rowKey={(record) => `${record.rank}-${record.horse}`}
          loading={loading}
          columns={standingColumns}
          dataSource={data.standings}
          pagination={false}
          rowClassName={(record) => (record.owner === "Golden Hoof Stable" ? "owner-highlight-row" : "")}
        />
      </Card>
    </Space>
  );
}
