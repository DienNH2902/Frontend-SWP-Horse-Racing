import { Avatar, Button, Layout, Menu, Space, Typography } from "antd";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/storage";
import { getDisplayName, getInitials, normalizeRole } from "../utils/roles";

const { Sider, Header, Content } = Layout;

export default function RoleLayout({ role, title, subtitle, navItems }) {
    const navigate = useNavigate();
    const location = useLocation();
    const session = getAuthSession();

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (role && normalizeRole(session?.user?.role) !== normalizeRole(role)) {
        return <Navigate to="/" replace />;
    }

    const user = session?.user || {};
    const displayName = getDisplayName(user);
    const initials = getInitials(displayName);

    const selectedKey =
        [...navItems]
            .sort((first, second) => second.to.length - first.to.length)
            .find((item) => location.pathname.startsWith(item.to))?.key || navItems[0]?.key;

    function handleLogout() {
        clearAuthSession();
        navigate("/login", { replace: true });
    }

    return (
        <Layout style={{ minHeight: "100dvh", background: "#f6fbfa" }}>
            <style>{`
        .role-sider {
          background: linear-gradient(180deg, #052a26 0%, #021b19 100%) !important;
          border-right: 1px solid rgba(105, 248, 221, 0.12);
        }
        .role-brand {
          height: 72px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          color: #f4fffb;
          font-weight: 900;
          letter-spacing: .2px;
        }
        .role-menu {
          background: transparent !important;
          border-inline-end: 0 !important;
        }
        .role-menu .ant-menu-item {
          height: 44px;
          line-height: 44px;
          color: rgba(244, 255, 251, 0.76) !important;
          border-radius: 10px;
          margin: 8px 12px !important;
        }
        .role-menu .ant-menu-item-selected {
          background: rgba(105, 248, 221, 0.12) !important;
          color: #69f8dd !important;
        }
        .role-link {
          color: inherit;
          text-decoration: none;
          display: block;
          width: 100%;
        }
      `}</style>

            <Sider width={250} className="role-sider">
                <div className="role-brand">GoldenHoof</div>

                <Menu
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    className="role-menu"
                    items={navItems.map((item) => ({
                        key: item.key,
                        label: <NavLink className="role-link" to={item.to}>{item.label}</NavLink>,
                    }))}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 24px",
                        height: 72,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #e7efed",
                    }}
                >
                    <Space direction="vertical" size={0}>
                        <Typography.Text type="secondary">{subtitle}</Typography.Text>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            {title}
                        </Typography.Title>
                    </Space>

                    <Space>
                        <Avatar style={{ background: "#06332e", color: "#69f8dd", fontWeight: 800 }}>
                            {initials}
                        </Avatar>
                        <span>{displayName}</span>
                        <Button onClick={handleLogout}>Logout</Button>
                    </Space>
                </Header>

                <Content style={{ padding: 24 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
