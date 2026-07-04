import { Avatar, Button, Layout, Tooltip, Typography } from "antd";
import {
  DashboardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GiftOutlined,
  HomeOutlined,
  IdcardOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ScheduleOutlined,
  TeamOutlined,
  TrophyOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/storage";
import { getDisplayName, getInitials } from "../utils/roles";

const { Content, Header, Sider } = Layout;

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        path: "/admin/dashboard",
        label: "Dashboard",
        icon: <DashboardOutlined />,
      },
    ],
  },
  {
    label: "People",
    items: [
      { path: "/admin/users", label: "Users", icon: <TeamOutlined /> },
      {
        path: "/admin/jockey-license",
        label: "Jockey Licenses",
        icon: <IdcardOutlined />,
      },
    ],
  },
  {
    label: "Competition",
    items: [
      {
        path: "/admin/tournaments",
        label: "Tournaments",
        icon: <TrophyOutlined />,
      },
      {
        path: "/admin/registrations",
        label: "Registrations",
        icon: <ProfileOutlined />,
      },
      { path: "/admin/races", label: "Races", icon: <ScheduleOutlined /> },
      {
        path: "/admin/raceCourse",
        label: "Race Courses",
        icon: <EnvironmentOutlined />,
      },
      {
        path: "/admin/prize",
        label: "Prize Distribution",
        icon: <GiftOutlined />,
      },
    ],
  },
  {
    label: "Finance & Engagement",
    items: [
      { path: "/admin/reward", label: "Rewards", icon: <GiftOutlined /> },
      {
        path: "/admin/withdrawal",
        label: "Withdrawals",
        icon: <WalletOutlined />,
      },
      { path: "/admin/bet", label: "Bets", icon: <DollarOutlined /> },
      { path: "/admin/report", label: "Reports", icon: <FileTextOutlined /> },
    ],
  },
];

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getAuthSession()?.user || {};
  const displayName = getDisplayName(user) || "Administrator";
  const initials = getInitials(displayName);
  const avatarUrl = user?.avatar || user?.avatarUrl || user?.imageUrl;

  function isActive(path) {
    if (path === "/admin/dashboard") {
      return ["/admin", "/admin/dashboard"].includes(location.pathname);
    }

    return location.pathname === path;
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <Layout className="admin-layout">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0d2321;
          background: #f7fffd;
        }

        .admin-layout { min-height: 100dvh; background: #f6fbfa; }
        .admin-sidebar.ant-layout-sider {
          position: sticky;
          top: 0;
          height: 100dvh;
          border-right: 1px solid rgba(105, 248, 221, 0.12);
          background: linear-gradient(180deg, #052a26 0%, #021b19 100%);
        }

        .admin-sidebar-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 0 12px 14px;
          overflow: hidden;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 72px;
          padding: 0 8px;
          color: #f4fffb;
          font-size: 21px;
          font-weight: 950;
          text-decoration: none;
        }

        .admin-brand-logo { width: 36px; height: 36px; object-fit: contain; }
        .admin-nav-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 8px 0 14px;
          scrollbar-width: thin;
        }

        .admin-nav-group + .admin-nav-group { margin-top: 18px; }
        .admin-nav-label {
          margin: 0 10px 7px;
          color: rgba(244, 255, 251, 0.42);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .admin-nav-list { display: grid; gap: 5px; }
        .admin-nav-item {
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 11px;
          border-radius: 10px;
          color: rgba(244, 255, 251, 0.76);
          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .admin-nav-item .anticon { width: 18px; font-size: 17px; }
        .admin-nav-item:hover { color: #f4fffb; background: rgba(105, 248, 221, 0.08); }
        .admin-nav-item.active {
          color: #69f8dd;
          background: rgba(105, 248, 221, 0.12);
          font-weight: 900;
        }

        .admin-sidebar-footer {
          flex: 0 0 auto;
          padding-top: 12px;
          border-top: 1px solid rgba(105, 248, 221, 0.14);
        }

        .admin-account {
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          padding: 7px 8px 11px;
          color: #f4fffb;
          text-decoration: none;
        }

        .admin-account-avatar.ant-avatar { color: #69f8dd; background: #06332e; border: 1px solid rgba(105, 248, 221, 0.28); font-weight: 900; }
        .admin-account-copy { min-width: 0; }
        .admin-account-name, .admin-account-email {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .admin-account-name { font-size: 14px; font-weight: 900; }
        .admin-account-email { color: rgba(244, 255, 251, 0.5); font-size: 12px; }
        .admin-footer-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
        .admin-footer-actions .ant-btn {
          height: 38px;
          color: rgba(244, 255, 251, 0.76);
          border-color: rgba(105, 248, 221, 0.18);
          background: rgba(255, 255, 255, 0.03);
          font-weight: 800;
        }
        .admin-footer-actions .ant-btn:hover {
          color: #69f8dd !important;
          border-color: rgba(105, 248, 221, 0.42) !important;
          background: rgba(105, 248, 221, 0.08) !important;
        }
        .admin-logout-btn.ant-btn { color: #ffb4ab; }

        .admin-header.ant-layout-header {
          height: 72px;
          display: flex;
          align-items: center;
          padding: 0 24px;
          border-bottom: 1px solid #e7efed;
          background: #fff;
        }

        .admin-header-copy { display: flex; flex-direction: column; }
        .admin-header-title.ant-typography { margin: 0; color: #06332e; }

        .admin-content.ant-layout-content {
          min-width: 0;
          padding: 28px;
          background: #f6fbfa;
        }

        @media (max-width: 920px) {
          .admin-layout { display: block; }
          .admin-sidebar.ant-layout-sider {
            position: static;
            max-width: none !important;
            min-width: 0 !important;
            width: 100% !important;
            height: auto;
            border-right: 0;
            border-bottom: 1px solid #e7efed;
          }
          .admin-sidebar-inner { height: auto; max-height: none; }
          .admin-nav-scroll { overflow: visible; }
          .admin-content.ant-layout-content { padding: 18px; }
        }
      `}</style>

      <Sider className="admin-sidebar" width={250}>
        <div className="admin-sidebar-inner">
          <Link className="admin-brand" to="/admin/dashboard">
            <img
              className="admin-brand-logo"
              src="/goldenhoof-logo.png"
              alt="GoldenHoof"
            />
            <span>GoldenHoof</span>
          </Link>

          <nav className="admin-nav-scroll" aria-label="Admin navigation">
            {NAV_GROUPS.map((group) => (
              <section className="admin-nav-group" key={group.label}>
                <div className="admin-nav-label">{group.label}</div>
                <div className="admin-nav-list">
                  {group.items.map((item) => (
                    <Link
                      className={`admin-nav-item ${isActive(item.path) ? "active" : ""}`}
                      to={item.path}
                      key={item.path}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <div className="admin-sidebar-footer">
            <Link className="admin-account" to="/profile">
              <Avatar className="admin-account-avatar" src={avatarUrl}>
                {initials}
              </Avatar>
              <div className="admin-account-copy">
                <div className="admin-account-name">{displayName}</div>
                <div className="admin-account-email">
                  {user?.email || "Admin account"}
                </div>
              </div>
            </Link>

            <div className="admin-footer-actions">
              <Tooltip title="Open home">
                <Button
                  icon={<HomeOutlined />}
                  onClick={() => navigate("/home")}
                >
                  Home
                </Button>
              </Tooltip>
              <Button
                className="admin-logout-btn"
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Sider>

      <Layout>
        {/* <Header className="admin-header">
          <div className="admin-header-copy">
            <Typography.Text type="secondary">
              Operations and management
            </Typography.Text>
            <Typography.Title level={4} className="admin-header-title">
              Admin workspace
            </Typography.Title>
          </div>
        </Header> */}

        <Content className="admin-content">{children}</Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
