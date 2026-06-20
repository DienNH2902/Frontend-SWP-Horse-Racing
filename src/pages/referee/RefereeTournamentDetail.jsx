import { useEffect, useState } from "react";
import {
  Card,
  Descriptions,
  Spin,
  Table,
  Tag,
  Space,
  Typography,
} from "antd";
import { Link, useParams } from "react-router-dom";

import { getTournamentById } from "../../api/services/tournament.service";
import { getRacesByTournament } from "../../api/services/race.service";

export default function RefereeTournamentDetail() {
  const { id } = useParams();

  const [tournament, setTournament] = useState(null);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const tournamentData =
          await getTournamentById(id);

        setTournament(tournamentData);

        const raceData =
          await getRacesByTournament(id);

        setRaces(raceData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const raceColumns = [
    {
      title: "Race Name",
      dataIndex: "name",
    },
    {
      title: "Round",
      dataIndex: "roundNumber",
    },
    {
      title: "Order",
      dataIndex: "raceOrder",
    },
    {
      title: "Date",
      render: (_, record) =>
        new Date(record.date).toLocaleDateString(),
    },
    {
      title: "Start Time",
      render: (_, record) =>
        new Date(
          record.startTime
        ).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        let color = "blue";

        if (status === "Ready")
          color = "green";

        if (status === "Scheduled")
          color = "orange";

        if (status === "Completed")
          color = "success";

        return (
          <Tag color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Horses",
      render: (_, record) =>
        record.horses?.length || 0,
    },
    {
      title: "Action",
      render: (_, record) => (
        <Link
          to={`/referee/races/${record._id}`}
        >
          View Detail
        </Link>
      ),
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  if (!tournament) {
    return (
      <Typography.Text>
        Tournament not found
      </Typography.Text>
    );
  }

  return (
    <Space
      direction="vertical"
      size={16}
      style={{ width: "100%" }}
    >
      <Card title={tournament.title}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Location">
            {tournament.location}
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            <Tag color="blue">
              {tournament.status}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Start Date">
            {tournament.startDate}
          </Descriptions.Item>

          <Descriptions.Item label="End Date">
            {tournament.endDate}
          </Descriptions.Item>

          <Descriptions.Item label="Rounds">
            {tournament.totalRounds}
          </Descriptions.Item>

          <Descriptions.Item label="Entry Fee">
            {tournament.entryFee?.toLocaleString()}
            {" "}VND
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={`Races (${races.length})`}
      >
        <Table
          rowKey="_id"
          columns={raceColumns}
          dataSource={races}
          pagination={false}
        />
      </Card>
    </Space>
  );
}