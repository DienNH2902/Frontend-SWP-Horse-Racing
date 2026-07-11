import { Card, Empty, Table, Tag, Typography } from "antd";

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function formatRaceDate(value) {
  if (!value) return "N/A";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("vi-VN");
}

function buildHistoryRows(history) {
  return asArray(history)
    .filter((item) => item && typeof item === "object" && (item.raceId || item.raceName))
    .map((item, index) => ({
      key: `${item.tournamentId || "tournament"}-${item.raceId || "race"}-${index}`,
      tournamentId: item.tournamentId || "N/A",
      tournamentName: item.tournamentName || "",
      raceId: item.raceId || "N/A",
      raceName: item.raceName || "",
      date: formatRaceDate(item.date),
      ownerId: item.horseOwnerId || "",
      ownerName: item.horseOwnerName || "",
      jockeyId: item.jockeyProfileId || "",
      jockeyName: item.jockeyName || "",
      horseName: item.horseName || "",
      finalRank: item.finalRank ?? "",
      result: item.result || null,
    }));
}

function RaceLabel({ name }) {
  return name ? <Typography.Text strong>{name}</Typography.Text> : "N/A";
}

export default function RaceHistoryCard({ history, loading = false, participantLabel = "Participant" }) {
  const rows = buildHistoryRows(history);

  const columns = [
    {
      title: "Tournament",
      dataIndex: "tournamentName",
      render: (value) => value || "N/A",
    },
    {
      title: "Race",
      dataIndex: "raceName",
      render: (value) => <RaceLabel name={value} />,
    },
    {
      title: "Date",
      dataIndex: "date",
      width: 120,
      responsive: ["md"],
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
      title: "Rank",
      dataIndex: "finalRank",
      width: 96,
      render: (value) => (value ? <Tag color={Number(value) === 1 ? "gold" : "blue"}>#{value}</Tag> : "N/A"),
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
