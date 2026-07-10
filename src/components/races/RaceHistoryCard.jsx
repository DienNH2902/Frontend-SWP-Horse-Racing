import { Card, Empty, Space, Table, Tag, Typography } from "antd";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function pickFirstValue(source, keys, fallback = "") {
  if (!source || typeof source !== "object") return fallback;

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null && value !== "") return value;
  }

  return fallback;
}

function getReferenceId(reference, keys = ["id", "_id"]) {
  if (!reference) return "";
  if (typeof reference === "string") return reference;

  return pickFirstValue(reference, keys, "");
}

function normalizeRound(value, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;

  const match = String(value).match(/\d+/);
  return match ? match[0] : String(value);
}

function buildHistoryRows(history) {
  const rows = [];

  function addRaceRow(item, context = {}) {
    const race = item?.race || item?.raceInfo || {};
    const tournament = item?.tournament || item?.tournamentInfo || {};
    const owner = item?.owner || item?.ownerInfo || {};
    const jockey = item?.jockey || item?.jockeyInfo || {};
    const horse = item?.horse || item?.horseInfo || {};

    const raceId =
      pickFirstValue(item, ["raceId", "race_id"]) ||
      getReferenceId(race, ["id", "_id", "raceId"]);

    if (!raceId && !item?.raceName && !race?.name) return;

    rows.push({
      key: `${context.tournamentId || "tournament"}-${context.round || "round"}-${raceId || rows.length}`,
      tournamentId:
        pickFirstValue(item, ["tournamentId", "tournament_id"]) ||
        getReferenceId(tournament, ["id", "_id", "tournamentId"]) ||
        context.tournamentId ||
        "N/A",
      tournamentName:
        pickFirstValue(item, ["tournamentName"]) ||
        pickFirstValue(tournament, ["name", "title"], ""),
      round: normalizeRound(pickFirstValue(item, ["round", "roundNumber"]), context.round || "N/A"),
      raceId: raceId || "N/A",
      raceName:
        pickFirstValue(item, ["raceName", "name", "title"]) ||
        pickFirstValue(race, ["name", "title", "raceName"], ""),
      ownerId:
        pickFirstValue(item, ["ownerId", "owner_id"]) ||
        getReferenceId(owner, ["id", "_id", "ownerId"]),
      ownerName:
        pickFirstValue(item, ["ownerName"]) ||
        pickFirstValue(owner, ["fullName", "name", "stableName"], ""),
      jockeyId:
        pickFirstValue(item, ["jockeyId", "jockey_id"]) ||
        getReferenceId(jockey, ["id", "_id", "jockeyId"]),
      jockeyName:
        pickFirstValue(item, ["jockeyName"]) ||
        pickFirstValue(jockey, ["fullName", "name"], ""),
      horseName:
        pickFirstValue(item, ["horseName"]) ||
        pickFirstValue(horse, ["name", "horseName"], ""),
      status: pickFirstValue(item, ["status", "raceStatus"], ""),
      result: item?.result || item?.raceResult || null,
    });
  }

  function visit(value, context = {}) {
    asArray(value).forEach((item) => {
      if (!item || typeof item !== "object") return;

      const nextContext = {
        tournamentId:
          pickFirstValue(item, ["tournamentId", "tournament_id"]) ||
          getReferenceId(item.tournament || item.tournamentInfo, ["id", "_id", "tournamentId"]) ||
          context.tournamentId,
        round: normalizeRound(pickFirstValue(item, ["round", "roundNumber"]), context.round),
      };

      if (Array.isArray(item.historyRace)) visit(item.historyRace, nextContext);
      if (Array.isArray(item.rounds)) visit(item.rounds, nextContext);
      if (Array.isArray(item.races)) visit(item.races, nextContext);

      Object.entries(item).forEach(([key, childValue]) => {
        const roundMatch = key.match(/^round\s*(\d+)$/i);
        if (roundMatch && Array.isArray(childValue)) {
          visit(childValue, { ...nextContext, round: roundMatch[1] });
        }
      });

      addRaceRow(item, nextContext);
    });
  }

  visit(history);

  return rows;
}

function RaceLabel({ id, name }) {
  return (
    <Space direction="vertical" size={0}>
      {name ? <Typography.Text strong>{name}</Typography.Text> : null}
      <Typography.Text copyable={id !== "N/A"}>{id}</Typography.Text>
    </Space>
  );
}

export default function RaceHistoryCard({ history, loading = false, participantLabel = "Participant" }) {
  const rows = buildHistoryRows(history);

  const columns = [
    {
      title: "Tournament",
      dataIndex: "tournamentId",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          {record.tournamentName ? <Typography.Text strong>{record.tournamentName}</Typography.Text> : null}
          <Typography.Text copyable={value !== "N/A"}>{value}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Round",
      dataIndex: "round",
      width: 96,
      render: (value) => <Tag color="blue">Round {value}</Tag>,
    },
    {
      title: "Race",
      dataIndex: "raceId",
      render: (value, record) => <RaceLabel id={value} name={record.raceName} />,
    },
    {
      title: participantLabel,
      render: (_, record) => {
        const name = participantLabel === "Owner" ? record.ownerName : record.jockeyName;
        const id = participantLabel === "Owner" ? record.ownerId : record.jockeyId;

        return name || id || "N/A";
      },
      responsive: ["md"],
    },
    {
      title: "Horse",
      dataIndex: "horseName",
      render: (value) => value || "N/A",
      responsive: ["lg"],
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => (value ? <Tag color="green">{value}</Tag> : "N/A"),
      responsive: ["md"],
    },
  ];

  return (
    <Card title="Race history" extra={<Tag color="gold">{rows.length} races</Tag>}>
      <Table
        rowKey="key"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 5, hideOnSinglePage: true }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No race history yet"
            />
          ),
        }}
      />
    </Card>
  );
}
