import {
    Avatar,
    Button,
    Layout,
    Menu,
    Tooltip,
} from "antd";

import {
    LogoutOutlined,
    MenuOutlined,
} from "@ant-design/icons";

import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    useEffect,
    useState,
} from "react";

import {
    getProfile,
} from "../api/services/auth.service";

import {
    clearAuthSession,
    getAuthSession,
} from "../utils/storage";

import {
    getInitials,
} from "../utils/roles";

import "./RefereeLayout.css";

const { Sider, Content } = Layout;

export default function RefereeLayout({
    role = "Referee",
    navItems = [],
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const session = getAuthSession();

    const [user, setUser] = useState(
        () =>
            session?.user || {
                fullName: "Referee",
                role,
            },
    );

    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false);

    const displayName =
        user?.fullName ||
        user?.name ||
        user?.username ||
        "Referee";

    const initials = getInitials(displayName);

    const selectedKey =
        [...navItems]
            .sort(
                (a, b) =>
                    b.to.length - a.to.length,
            )
            .find((item) =>
                location.pathname.startsWith(
                    item.to,
                ),
            )?.key || navItems[0]?.key;

    useEffect(() => {
        let active = true;

        getProfile()
            .then((profile) => {
                if (active && profile) {
                    setUser((current) => ({
                        ...current,
                        ...profile,
                    }));
                }
            })
            .catch(() => { });

        return () => {
            active = false;
        };
    }, []);

    function handleLogout() {
        clearAuthSession();
        navigate("/login", {
            replace: true,
        });
    }

    function closeMobileMenu() {
        setIsMobileMenuOpen(false);
    }

    return (
        <Layout
            className={`referee-layout ${isMobileMenuOpen
                ? "referee-layout-menu-open"
                : ""
                }`}
        >
            <button
                className="referee-mobile-backdrop"
                type="button"
                aria-label="Close navigation"
                onClick={closeMobileMenu}
            />

            <Sider
                width={250}
                className="referee-sider"
            >
                <div className="referee-sider-inner">
                    <div className="referee-brand">
                        <img
                            className="referee-brand-logo"
                            src="/goldenhoof-logo.png"
                            alt=""
                        />

                        <span>GoldenHoof</span>
                    </div>

                    <div className="referee-menu-scroll">
                        <Menu
                            mode="inline"
                            selectedKeys={[selectedKey]}
                            className="referee-menu"
                            items={navItems.map(
                                (item) => ({
                                    key: item.key,
                                    label: (
                                        <NavLink
                                            className="referee-link"
                                            to={item.to}
                                            onClick={
                                                closeMobileMenu
                                            }
                                        >
                                            {item.label}
                                        </NavLink>
                                    ),
                                }),
                            )}
                        />
                    </div>

                    <div className="referee-sider-footer">
                        <div className="referee-account">
                            <Avatar className="referee-avatar">
                                {initials}
                            </Avatar>

                            <div className="referee-account-copy">
                                <span className="referee-account-name">
                                    {displayName}
                                </span>

                                <span className="referee-account-email">
                                    {user.email ||
                                        displayName}
                                </span>
                            </div>

                            <Tooltip title="Logout">
                                <Button
                                    className="referee-logout-icon"
                                    shape="circle"
                                    danger
                                    icon={
                                        <LogoutOutlined />
                                    }
                                    onClick={
                                        handleLogout
                                    }
                                />
                            </Tooltip>
                        </div>

                        <Button
                            block
                            onClick={() =>
                                navigate("/home")
                            }
                        >
                            Home
                        </Button>
                    </div>
                </div>
            </Sider>

            <Layout>
                <div className="referee-mobile-header">
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        className="referee-mobile-menu-btn"
                        onClick={() =>
                            setIsMobileMenuOpen(true)
                        }
                    />
                </div>

                <Content className="referee-content">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}