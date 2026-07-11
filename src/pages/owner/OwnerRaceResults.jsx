import { useEffect, useState } from "react";
import { Alert, Card, Col, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import { getOwnerRaceCenter } from "../../api/services/owner.service";
import RaceHistoryCard from "../../components/races/RaceHistoryCard";

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function collectFinalRanks(history) {
  const ranks = [];

  function visit(value) {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value !== "object") return;

    const rank = Number(value.finalRank ?? value.rank ?? value.rawRank);
    if (Number.isFinite(rank)) {
      ranks.push(rank);
    }

    ["historyRace", "rounds", "races"].forEach((key) => {
      if (Array.isArray(value[key])) visit(value[key]);
    });
  }

  visit(history);

  return ranks;
}

export default function OwnerRaceResults() {
  const [data, setData] = useState({ races: [], standings: [], historyRaceOwner: [] });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    getOwnerRaceCenter()
      .then((result) => {
        if (!mounted) return;
        setData(result);
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

  const finishedRaces = data.races.filter((race) => race.status === "Finished");
  const totalPrize = finishedRaces.reduce((sum, race) => sum + (race.result?.prize || 0), 0);
  const historyRanks = collectFinalRanks(data.historyRaceOwner);
  const raceRanks = data.races
    .map((race) => Number(race.result?.rank))
    .filter((rank) => Number.isFinite(rank));
  const bestRanks = historyRanks.length ? historyRanks : raceRanks;
  const bestRank = bestRanks.length ? Math.min(...bestRanks) : null;

  const raceColumns = [
    {
      title: "Race",
      dataIndex: "name",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
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

      <Card title="Race information and results">
        <Table
          rowKey="id"
          loading={loading}
          columns={raceColumns}
          dataSource={data.races}
          pagination={false}
        />
      </Card>

      <RaceHistoryCard
        history={data.historyRaceOwner}
        loading={loading}
        participantLabel="Jockey"
      />
    </Space>
  );
}
