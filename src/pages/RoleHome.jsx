import { Link, Navigate, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/storage";

const roleConfig = {
  Spectator: {
    title: "Spectator Space",
    subtitle: "Follow live races, predictions, rankings, and your favorite horses.",
    tasks: ["Watch live race updates", "Make race predictions", "Track leaderboard points"],
  },
  Jockey: {
    title: "Jockey Workspace",
    subtitle: "Manage your racing profile, upcoming races, and performance stats.",
    tasks: ["Review assigned races", "Update jockey profile", "Track wins and win rate"],
  },
};

export default function RoleHome({ allowedRole }) {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const user = authSession?.user;
  const config = roleConfig[allowedRole];

  if (!authSession) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/", { replace: true });
  }

  return (
    <main className="role-page">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f7fffd;
          color: #0d2321;
        }
        .role-page {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: 24px;
          background:
            linear-gradient(135deg, rgba(0, 45, 40, 0.94), rgba(0, 118, 102, 0.76)),
            url("/goldenhoof-hero.png") center / cover;
        }
        .role-card {
          width: min(760px, 100%);
          padding: 34px;
          border: 1px solid rgba(105, 248, 221, 0.3);
          border-radius: 8px;
          color: #f4fffb;
          background: rgba(0, 45, 40, 0.92);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
        }
        .role-kicker {
          color: #69f8dd;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 0;
        }
        .role-card h1 {
          margin: 12px 0 10px;
          font-size: clamp(34px, 6vw, 54px);
          line-height: 1.05;
          font-weight: 950;
        }
        .role-card p {
          margin: 0;
          color: rgba(244, 255, 251, 0.78);
          font-size: 17px;
          line-height: 1.6;
        }
        .role-user {
          margin-top: 22px;
          padding: 16px;
          border: 1px solid rgba(105, 248, 221, 0.22);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }
        .role-tasks {
          display: grid;
          gap: 12px;
          margin: 26px 0;
          padding: 0;
          list-style: none;
        }
        .role-tasks li {
          padding: 14px 16px;
          border-radius: 8px;
          color: #06332e;
          background: #d9fbf4;
          font-weight: 900;
        }
        .role-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .role-btn {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 18px;
          border: 1px solid rgba(105, 248, 221, 0.42);
          border-radius: 8px;
          color: #f4fffb;
          background: transparent;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
        }
        .role-btn-primary {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
        }
      `}</style>

      <section className="role-card">
        <span className="role-kicker">{allowedRole}</span>
        <h1>{config.title}</h1>
        <p>{config.subtitle}</p>

        <div className="role-user">
          <strong>{user.fullName || user.name || user.email}</strong>
          <p>{user.email}</p>
        </div>

        <ul className="role-tasks">
          {config.tasks.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>

        <div className="role-actions">
          <Link className="role-btn role-btn-primary" to="/">
            Landing
          </Link>
          <Link className="role-btn" to="/home">
            Explore Races
          </Link>
          <Link className="role-btn" to="/profile">
            Profile
          </Link>
          <button className="role-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
