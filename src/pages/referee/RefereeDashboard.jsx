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
  Button,
} from "antd";
import {
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FlagOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { getMyRaces } from "../../api/services/race.service";
import { getRaceCourseById }
  from "../../api/services/race-course.service";

function statusColor(status) {
  switch (status) {
    case "Preparing":
      return "blue";

    case "Ready":
      return "gold";

    case "InProgress":
      return "processing";

    case "Finished":
      return "green";

    case "Canceled":
      return "red";

    default:
      return "default";
  }
}

export default function RefereeDashboard() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRaces();
  }, []);

  useEffect(() => {
    console.log("RACES STATE:", races);

    if (races.length > 0) {
      console.log(
        "FIRST RACE:",
        races[0]
      );
    }
  }, [races]);

  async function loadRaces() {
    try {
      setLoading(true);

      const data = await getMyRaces();

      const raceList = Array.isArray(data)
        ? data
        : data?.data || [];

      const racesWithCourse =
        await Promise.all(
          raceList.map(async (race) => {
            try {
              const raceCourse =
                await getRaceCourseById(
                  race.raceCourseId
                );

              return {
                ...race,
                raceCourse,
              };
            } catch {
              return race;
            }
          })
        );

      setRaces(racesWithCourse);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        "Cannot load assigned races."
      );
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => ({
    scheduled: races.filter(
      race => race.status === "Scheduled"
    ).length,

    ready: races.filter(
      race => race.status === "Ready"
    ).length,

    finished: races.filter(
      race => race.status === "Finished"
    ).length,

    inProgress: races.filter(
      race => race.status === "InProgress"
    ).length,
  }), [races]);

  const columns = [
    {
      title: "Race",
      render: (_, record) =>
        record.name ||
        `Race #${record.id}`,
    },

    {
      title: "Tournament",
      render: (_, record) =>
        record.tournamentTitle ||
        record.tournament?.name ||
        "-",
    },

    {
      title: "Round",
      render: (_, record) =>
        record.roundNumber ||
        record.round ||
        "-",
    },

    {
      title: "Race Course",
      render: (_, record) => (
        <>
          {console.log(record)}
          {record.raceCourse?.name ||
            record.raceCourseName ||
            record.courseName ||
            record.raceCourseId ||
            "-"}
        </>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={statusColor(status)}>
          {status}
        </Tag>
      ),
    },

    {
      title: "Action",
      render: (_, record) => (
        <Space>
          <Link
            to={`/referee/races/${record._id}`}
          >
            <Button type="primary">
              View
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Space
      direction="vertical"
      size={16}
      style={{ width: "100%" }}
    >
      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message={errorMessage}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Assigned Races"
              value={races.length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Preparing"
              value={stats.preparing}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Ready"
              value={stats.ready}
              prefix={<FlagOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card>
            <Statistic
              title="Finished"
              value={stats.finished}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="My Assigned Races"
        extra={
          <Typography.Text type="secondary">
            Manage your assigned races
          </Typography.Text>
        }
      >
        {loading ? (
          <Skeleton
            active
            paragraph={{ rows: 8 }}
          />
        ) : races.length === 0 ? (
          <Empty description="No races assigned" />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={races}
            pagination={{
              pageSize: 5,
            }}
          />
        )}
      </Card>

      <Card title="Referee Workspace">
        <Typography.Paragraph
          type="secondary"
          style={{ marginBottom: 0 }}
        >
          Review your assigned races,
          configure race conditions,
          confirm readiness,
          run simulations,
          and submit final reports after
          each race.
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}