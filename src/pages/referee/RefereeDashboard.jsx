import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import { getTournaments } from "../../api/services/tournament.service";



function statusColor(status) {
  switch (status) {
    case "Preparing":
      return "blue";

    case "Canceled":
      return "red";

    default:
      return "default";
  }
}

export default function RefereeDashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadTournaments();
  }, []);

  async function loadTournaments() {
    try {
      setLoading(true);

      const data = await getTournaments();

      setTournaments(
        Array.isArray(data)
          ? data
          : data?.data || []
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const preparing = tournaments.filter(
      (item) => item.status === "Preparing"
    ).length;

    const canceled = tournaments.filter(
      (item) => item.status === "Canceled"
    ).length;

    return {
      preparing,
      canceled,
    };
  }, [tournaments]);

  const columns = [
    {
      title: "Tournament",
      dataIndex: "title",

      render: (_, record) => (
        <Link
          to={`/referee/tournaments/${record._id}`}
        >
          {record.title}
        </Link>
      ),
    },

    {
      title: "Location",
      dataIndex: "location",
    },

    {
      title: "Start Date",
      dataIndex: "startDate",
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const label =
          status === "Preparing"
            ? "Preparing"
            : status === "Canceled"
              ? "Canceled"
              : status;

        return (
          <Tag color={statusColor(status)}>
            {label}
          </Tag>
        );
      },
    }
  ];

  return (
    <Space
      direction="vertical"
      size={16}
      style={{ width: "100%" }}
    >
      {errorMessage && (<Alert
        type="warning"
        showIcon
        message={errorMessage}
      />
      )}

      ```
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={8}>
          <Card>
            <Statistic
              title="Total Tournaments"
              value={tournaments.length}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <Card>
            <Statistic
              title="Preparing"
              value={stats.preparing}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <Card>
            <Statistic
              title="Canceled"
              value={stats.canceled}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Tournament List"
        extra={
          <Typography.Text type="secondary">
            Select a tournament to view races
          </Typography.Text>
        }
      >
        {loading ? (
          <Skeleton
            active
            paragraph={{ rows: 6 }}
          />
        ) : tournaments.length === 0 ? (
          <Empty description="No tournaments found" />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={tournaments}
            pagination={false}
          />
        )}
      </Card>

      <Card title="Referee Workspace">
        <Typography.Paragraph
          type="secondary"
          style={{ marginBottom: 0 }}
        >
          Choose a tournament, open a race,
          review participants, record violations,
          and confirm official race results.
        </Typography.Paragraph>
      </Card>
    </Space>


  );
}
