import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  EnvironmentOutlined,
  FlagOutlined,
  ReloadOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { getHorses } from "../../api/services/horse.service";
import { getRaceCourses } from "../../api/services/race-course.service";
import { getRacesByTournament } from "../../api/services/race.service";
import { getUpcomingSchedule } from "../../api/services/schedule.service";
import { getTournaments } from "../../api/services/tournament.service";
import { getUsers } from "../../api/services/user.service";

const ROLE_ORDER = ["Spectator", "Horse Owner", "Jockey", "Referee"];

const ROLE_COLORS = {
  Spectator: "#0f9f89",
  "Horse Owner": "#7c3aed",
  Jockey: "#d97706",
  Referee: "#2563eb",
};

function resolveList(response) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  for (const key of [
    "data",
    "items",
    "users",
    "horses",
    "tournaments",
    "races",
    "raceCourses",
    "content",
    "records",
    "result",
  ]) {
    if (Array.isArray(response[key])) return response[key];

    const nested = resolveList(response[key]);
    if (nested.length) return nested;
  }

  return [];
}

function getId(item) {
  return item?._id || item?.id || "";
}

function normalizeRole(value) {
  const role = String(value || "").toLowerCase();

  if (role.includes("admin")) return "Admin";
  if (role.includes("referee")) return "Referee";
  if (role.includes("jockey")) return "Jockey";
  if (role.includes("owner") || role.includes("horse")) return "Horse Owner";

  return "Spectator";
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("vi-VN");
}

function formatTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRaceStatusColor(status) {
  const value = String(status || "").toLowerCase();

  if (value === "ready") return "gold";
  if (value === "scheduled") return "blue";
  if (value === "ongoing") return "green";
  if (value === "finished" || value === "completed") return "default";
  if (value === "cancelled" || value === "canceled") return "red";

  return "cyan";
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState({
    users: [],
    horses: [],
    tournaments: [],
    races: [],
    raceCourses: [],
    upcomingRaces: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [
        usersResult,
        horsesResult,
        tournamentsResult,
        coursesResult,
        upcomingResult,
      ] =
        await Promise.allSettled([
          getUsers(),
          getHorses(),
          getTournaments(),
          getRaceCourses(),
          getUpcomingSchedule(),
        ]);

      const users =
        usersResult.status === "fulfilled"
          ? resolveList(usersResult.value).filter(
              (user) =>
                normalizeRole(user?.role || user?.roleName || user?.type) !==
                "Admin",
            )
          : [];
      const horses =
        horsesResult.status === "fulfilled"
          ? resolveList(horsesResult.value)
          : [];
      const tournaments =
        tournamentsResult.status === "fulfilled"
          ? resolveList(tournamentsResult.value)
          : [];
      const raceCourses =
        coursesResult.status === "fulfilled"
          ? resolveList(coursesResult.value)
          : [];
      const upcomingRaces =
        upcomingResult.status === "fulfilled"
          ? resolveList(upcomingResult.value)
          : [];

      const raceResults = await Promise.allSettled(
        tournaments.map((tournament) => {
          const tournamentId = getId(tournament) || tournament?.tournamentId;
          return tournamentId
            ? getRacesByTournament(tournamentId)
            : Promise.resolve([]);
        }),
      );
      const races = raceResults.flatMap((result) =>
        result.status === "fulfilled" ? resolveList(result.value) : [],
      );
      const failedMainRequests = [
        usersResult,
        horsesResult,
        tournamentsResult,
        coursesResult,
        upcomingResult,
      ].filter((result) => result.status === "rejected").length;

      setDashboard({
        users,
        horses,
        tournaments,
        races: Array.from(
          new Map(
            races
              .filter((race) => getId(race))
              .map((race) => [getId(race), race]),
          ).values(),
        ),
        raceCourses,
        upcomingRaces,
      });

      if (failedMainRequests > 0) {
        setErrorMessage(
          `${failedMainRequests} dashboard data source(s) could not be loaded.`,
        );
      }
    } catch (error) {
      setErrorMessage(error?.message || "Unable to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const roleCounts = useMemo(() => {
    const counts = Object.fromEntries(ROLE_ORDER.map((role) => [role, 0]));

    dashboard.users.forEach((user) => {
      const role = normalizeRole(user?.role || user?.roleName || user?.type);
      counts[role] += 1;
    });

    return counts;
  }, [dashboard.users]);

  const raceStats = useMemo(() => {
    const stats = { scheduled: 0, ongoing: 0, finished: 0 };

    dashboard.races.forEach((race) => {
      const status = String(race?.status || "").toLowerCase();
      if (status === "scheduled" || status === "ready") stats.scheduled += 1;
      else if (
        status === "ongoing" ||
        status === "live" ||
        status === "inprogress" ||
        status === "in progress" ||
        status === "in_progress"
      ) {
        stats.ongoing += 1;
      } else if (status === "finished" || status === "completed") {
        stats.finished += 1;
      }
    });

    return stats;
  }, [dashboard.races]);

  const summaryCards = [
    {
      title: "Total Users",
      value: dashboard.users.length,
      icon: <TeamOutlined />,
      color: "#087a6d",
      background: "#e8fff9",
    },
    {
      title: "Horses",
      value: dashboard.horses.length,
      icon: <TrophyOutlined />,
      color: "#b45309",
      background: "#fff8e6",
    },
    {
      title: "Tournaments",
      value: dashboard.tournaments.length,
      icon: <TrophyOutlined />,
      color: "#7c3aed",
      background: "#f4efff",
    },
    {
      title: "Races",
      value: dashboard.races.length,
      icon: <FlagOutlined />,
      color: "#2563eb",
      background: "#edf4ff",
    },
    {
      title: "Race Courses",
      value: dashboard.raceCourses.length,
      icon: <EnvironmentOutlined />,
      color: "#be123c",
      background: "#fff0f4",
    },
  ];

  const upcomingRaceColumns = [
    {
      title: "Race",
      dataIndex: "raceName",
      key: "raceName",
      fixed: "left",
      width: 230,
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value || "Unnamed race"}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.tournamentName || "N/A"}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 110,
      render: formatDate,
    },
    {
      title: "Start",
      dataIndex: "startTime",
      key: "startTime",
      width: 90,
      render: formatTime,
    },
    {
      title: "Race Course",
      dataIndex: "raceCourseName",
      key: "raceCourseName",
      width: 220,
      render: (value) => value || "N/A",
    },
    {
      title: "Slots",
      key: "slots",
      width: 110,
      render: (_, record) =>
        `${record.filledSlots ?? 0}/${record.totalSlots ?? 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (value) => (
        <Tag color={getRaceStatusColor(value)}>{value || "Unknown"}</Tag>
      ),
    },
  ];

  return (
    <section className="admin-dashboard">
      <style>{`
        .admin-dashboard {
          color: #0d2321;
        }

        .admin-dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .admin-dashboard-kicker {
          color: #087a6d;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1.5px;
        }

        .admin-dashboard-title.ant-typography {
          margin: 5px 0 0;
          color: #06332e;
          font-size: clamp(30px, 4vw, 44px);
          font-weight: 950;
        }

        .admin-dashboard-refresh.ant-btn {
          border-color: #bdeee5;
          color: #006755;
          background: #fff;
          font-weight: 850;
        }

        .admin-stat-card {
          height: 100%;
          border: 1px solid #ccefe7;
          border-radius: 12px;
          box-shadow: 0 14px 36px rgba(13, 70, 63, 0.07);
        }

        .admin-stat-card .ant-statistic-title {
          color: #52726e;
          font-weight: 800;
        }

        .admin-stat-card .ant-statistic-content {
          color: #06332e;
          font-weight: 950;
        }

        .admin-stat-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          font-size: 20px;
        }

        .admin-dashboard-panel {
          height: 100%;
          border: 1px solid #ccefe7;
          border-radius: 12px;
          box-shadow: 0 14px 36px rgba(13, 70, 63, 0.06);
        }

        .role-breakdown-row {
          display: grid;
          grid-template-columns: 120px 1fr 44px;
          align-items: center;
          gap: 14px;
          margin-top: 17px;
        }

        .role-breakdown-row strong {
          color: #244a46;
        }

        .race-status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 18px;
        }

        .race-status-item {
          padding: 20px 12px;
          border-radius: 10px;
          background: #f3fffc;
          text-align: center;
        }

        .race-status-item strong {
          display: block;
          margin-bottom: 4px;
          color: #06332e;
          font-size: 28px;
        }

        @media (max-width: 640px) {
          .admin-dashboard-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .race-status-grid {
            grid-template-columns: 1fr;
          }
          .role-breakdown-row {
            grid-template-columns: 100px 1fr 36px;
          }
        }
      `}</style>

      <header className="admin-dashboard-header">
        <div>
          <div className="admin-dashboard-kicker">SYSTEM OVERVIEW</div>
          <Typography.Title level={1} className="admin-dashboard-title">
            Admin Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">
            Live statistics across the GoldenHoof platform
          </Typography.Text>
        </div>
        <Button
          className="admin-dashboard-refresh"
          icon={<ReloadOutlined />}
          loading={isLoading}
          onClick={loadDashboard}
        >
          Refresh
        </Button>
      </header>

      {errorMessage ? (
        <Alert
          type="warning"
          showIcon
          message={errorMessage}
          style={{ marginBottom: 20 }}
        />
      ) : null}

      {isLoading ? (
        <Card className="admin-dashboard-panel">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      ) : (
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            {summaryCards.map((item) => (
              <Col xs={24} sm={12} xl={8} xxl={4} key={item.title}>
                <Card className="admin-stat-card">
                  <Space size={16}>
                    <span
                      className="admin-stat-icon"
                      style={{
                        color: item.color,
                        background: item.background,
                      }}
                    >
                      {item.icon}
                    </span>
                    <Statistic title={item.title} value={item.value} />
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[20, 20]}>
            <Col xs={24} xl={14}>
              <Card
                className="admin-dashboard-panel"
                title="Users by Role"
                extra={<Tag color="green">{dashboard.users.length} accounts</Tag>}
              >
                {ROLE_ORDER.map((role) => {
                  const count = roleCounts[role];
                  const percent = dashboard.users.length
                    ? Math.round((count / dashboard.users.length) * 100)
                    : 0;

                  return (
                    <div className="role-breakdown-row" key={role}>
                      <strong>{role}</strong>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={ROLE_COLORS[role]}
                        trailColor="#edf5f3"
                      />
                      <Typography.Text strong>{count}</Typography.Text>
                    </div>
                  );
                })}
              </Card>
            </Col>

            <Col xs={24} xl={10}>
              <Card
                className="admin-dashboard-panel"
                title="Race Status"
                extra={<Tag color="blue">{dashboard.races.length} races</Tag>}
              >
                <div className="race-status-grid">
                  <div className="race-status-item">
                    <strong>{raceStats.scheduled}</strong>
                    <Typography.Text type="secondary">
                      Scheduled
                    </Typography.Text>
                  </div>
                  <div className="race-status-item">
                    <strong>{raceStats.ongoing}</strong>
                    <Typography.Text type="secondary">Ongoing</Typography.Text>
                  </div>
                  <div className="race-status-item">
                    <strong>{raceStats.finished}</strong>
                    <Typography.Text type="secondary">Finished</Typography.Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Card
            className="admin-dashboard-panel"
            title="Upcoming Races"
            extra={
              <Tag color="cyan">{dashboard.upcomingRaces.length} races</Tag>
            }
          >
            <Table
              columns={upcomingRaceColumns}
              dataSource={dashboard.upcomingRaces}
              rowKey={(record) => record.raceId || record._id || record.id}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 870 }}
              size="middle"
            />
          </Card>
        </Space>
      )}
    </section>
  );
}
