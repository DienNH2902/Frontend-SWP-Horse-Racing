import { Button, Layout } from "antd";
import "antd/dist/reset.css";
import { Link, useNavigate } from "react-router-dom";

const { Content, Sider } = Layout;

function AdminLayout({ children }) {
  const navigate = useNavigate();

  return (
    <Layout className="admin-layout">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0d2321;
          background: #f7fffd;
        }

        .admin-layout {
          min-height: 100dvh;
          background: #f7fffd;
        }

        .admin-sidebar.ant-layout-sider {
          border-right: 1px solid #ccefe7;
          background: #fff;
          box-shadow: 12px 0 40px rgba(13, 70, 63, 0.06);
        }

        .admin-sidebar-inner {
          position: sticky;
          top: 0;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 22px 16px;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          color: #06332e;
          font-size: 23px;
          font-weight: 950;
          text-decoration: none;
        }

        .admin-brand-logo {
          width: 38px;
          height: 38px;
          object-fit: contain;
        }

        .admin-nav-item {
          min-height: 48px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          border: 1px solid #bfeee6;
          border-radius: 8px;
          color: #006755;
          background: #edfffb;
          font-weight: 900;
          text-decoration: none;
        }

        .admin-home-btn.ant-btn {
          margin-top: auto;
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        .admin-home-btn.ant-btn:hover {
          border-color: transparent !important;
          color: #06332e !important;
          background: #75ffe6 !important;
        }

        .admin-content.ant-layout-content {
          padding: 28px;
          background:
            radial-gradient(circle at 90% 8%, rgba(105, 248, 221, 0.2), transparent 28%),
            #f7fffd;
        }

        @media (max-width: 920px) {
          .admin-layout {
            display: block;
          }
          .admin-sidebar.ant-layout-sider {
            max-width: none !important;
            min-width: 0 !important;
            width: 100% !important;
            border-right: 0;
            border-bottom: 1px solid #ccefe7;
          }
          .admin-sidebar-inner {
            min-height: 0;
          }
          .admin-content.ant-layout-content {
            padding: 18px;
          }
        }
      `}</style>

      <Sider className="admin-sidebar" width={290}>
        <div className="admin-sidebar-inner">
          <Link className="admin-brand" to="/admin/dashboard">
            <img className="admin-brand-logo" src="/navbar-logo.png" alt="" />
            <span>GoldenHoof</span>
          </Link>
          <Link className="admin-nav-item" to="/admin/users">
            User Management
          </Link>
          <Button className="admin-home-btn" onClick={() => navigate("/home")}>
            Quay lại Home
          </Button>
        </div>
      </Sider>

      <Content className="admin-content">{children}</Content>
    </Layout>
  );
}

export default AdminLayout;
