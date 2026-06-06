import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Empty, Input, Select, Space, Table, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

const mockRaces = [
  {
    id: 1,
    code: "RC001",
    name: "Golden Cup 2026",
    track: "Track A",
    time: "09:00",
    status: "Scheduled",
    entrants: [1, 2, 3],
  },
  {
    id: 2,
    code: "RC002",
    name: "Summer Derby",
    track: "Track B",
    time: "14:00",
    status: "Live",
    entrants: [1, 2],
  },
];

function statusColor(status) {
  const value = String(status || "").toLowerCase();

  if (value.includes("live")) return "red";
  if (value.includes("finished") || value.includes("official")) return "green";
  if (value.includes("cancel")) return "default";
  return "blue";
}

export default function RefereeRaces() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");

  const loadRaces = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      setRaces(mockRaces);
      setRaces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setRaces([]);
      setErrorMessage(error.message || "Could not load races.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRaces();
  }, [loadRaces]);

  const statusOptions = useMemo(() => {
    const statuses = [...new Set(races.map((race) => race.status).filter(Boolean))];
    return [
      { value: "all", label: "All status" },
      ...statuses.map((status) => ({ value: status, label: status })),
    ];
  }, [races]);

  const filteredRaces = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    return races.filter((race) => {
      const matchesKeyword =
        !query ||
        [race.name, race.code, race.track, race.distance, race.surface]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        String(race.status).toLowerCase() === String(statusFilter).toLowerCase();

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, races, statusFilter]);

  const columns = [
    {
      title: "Race",
      dataIndex: "name",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.code}</Typography.Text>
        </Space>
      ),
    },
    { title: "Track", dataIndex: "track", responsive: ["md"] },
    { title: "Date", dataIndex: "date", responsive: ["lg"] },
    { title: "Time", dataIndex: "time" },
    { title: "Distance", dataIndex: "distance", responsive: ["md"] },
    { title: "Surface", dataIndex: "surface", responsive: ["lg"] },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={statusColor(value)}>{value}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => <Link to={`/referee/races/${record.id}`}>Open detail</Link>,
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Card
        title="Race list"
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search race"
              style={{ width: 220 }}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={setKeyword}
            />
            <Select
              value={statusFilter}
              style={{ width: 160 }}
              onChange={setStatusFilter}
              options={statusOptions}
            />
            <Button onClick={loadRaces}>Refresh</Button>
            <Button onClick={() => { setKeyword(""); setStatusFilter("all"); }}>
              Reset
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredRaces}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No races match the current filters"
              />
            ),
          }}
        />
      </Card>
    </Space>
  );
}
