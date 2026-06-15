import { Avatar, Button, ConfigProvider, Layout, Menu, Space, Typography } from "antd";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/storage";
import { getDisplayName, getInitials } from "../utils/roles";

const { Sider, Header, Content } = Layout;

export default function RoleLayout({ role, title, subtitle, navItems }) {
    const navigate = useNavigate();
    const location = useLocation();
    const session = getAuthSession();
    const user = session?.user || { fullName: role || "GoldenHoof User", role };
    const displayName = getDisplayName(user);
    const initials = getInitials(displayName);
    const isOwnerRole = String(role).toLowerCase().includes("owner");
    const ownerTheme = isOwnerRole
        ? {
            token: {
                colorPrimary: "#69f8dd",
                colorPrimaryHover: "#4fe9cf",
                colorPrimaryActive: "#25ceb5",
                colorLink: "#087a6d",
                colorLinkHover: "#065f55",
                controlOutline: "rgba(105, 248, 221, 0.28)",
            },
        }
        : undefined;

    const selectedKey =
        [...navItems]
            .sort((first, second) => second.to.length - first.to.length)
            .find((item) => location.pathname.startsWith(item.to))?.key || navItems[0]?.key;

    function handleLogout() {
        clearAuthSession();
        navigate("/login", { replace: true });
    }

    return (
        <ConfigProvider theme={ownerTheme}>
            <Layout
                className={`role-layout${isOwnerRole ? " owner-role-layout" : ""}`}
            >
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
                <Header className="role-header">
                    <Space direction="vertical" size={0}>
                        <Typography.Text type="secondary">{subtitle}</Typography.Text>
                        <Typography.Title level={4} className="role-title">
                            {title}
                        </Typography.Title>
                    </Space>

                    <Space>
                        <Button onClick={() => navigate("/home")}>Home</Button>
                        <Avatar className="role-avatar">
                            {initials}
                        </Avatar>
                        <span>{displayName}</span>
                        <Button onClick={handleLogout}>Logout</Button>
                    </Space>
                </Header>

                <Content className="role-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
        </ConfigProvider>
    );
}
