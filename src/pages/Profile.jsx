import { Navigate, Link, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/storage";

function Profile() {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const user = authSession?.user || {};
  const displayName =
    user.fullName || user.name || user.email || user.username || "GoldenHoof User";
  const email = user.email || "No email available";

  if (!authSession) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    clearAuthSession();
    navigate("/", { replace: true });
  }

  return (
    <main className="profile-page">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f7fffd;
          color: #0d2321;
        }

        .profile-page {
          min-height: 100dvh;
          display: grid;
          place-items: center;
          padding: 24px;
          background:
            linear-gradient(135deg, rgba(0, 61, 54, 0.92), rgba(0, 124, 109, 0.78)),
            url("/goldenhoof-hero.png") center / cover;
        }

        .profile-card {
          width: min(520px, 100%);
          padding: 30px;
          border: 1px solid rgba(105, 248, 221, 0.28);
          border-radius: 8px;
          color: #f4fffb;
          background: rgba(0, 45, 40, 0.92);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
        }

        .profile-avatar {
          width: 74px;
          height: 74px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 50%;
          color: #06332e;
          background: #69f8dd;
          font-size: 24px;
          font-weight: 950;
        }

        .profile-card h1 {
          margin: 0 0 8px;
          font-size: 32px;
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: 0;
        }

        .profile-card p {
          margin: 0;
          color: rgba(244, 255, 251, 0.74);
        }

        .profile-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .profile-btn {
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

        .profile-btn-primary {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
        }
      `}</style>

      <section className="profile-card">
        <div className="profile-avatar">
          {displayName
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>
        <h1>{displayName}</h1>
        <p>{email}</p>
        <div className="profile-actions">
          <Link className="profile-btn profile-btn-primary" to="/">
            Back Home
          </Link>
          <button className="profile-btn" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}

export default Profile;
