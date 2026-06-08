import { Link, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/storage";

const roleData = {
  Spectator: {
    background: "/spectator-dashboard-bg.png",
    eyebrow: "Spectator Hub",
    title: "Race day command center",
    subtitle:
      "Discover events, follow live race movement, submit predictions, and track reward progress.",
    accent: "Fan rank #18",
    stats: [
      { label: "Prediction Points", value: "2,450", detail: "+180 this week" },
      { label: "Correct Picks", value: "64%", detail: "Last 25 races" },
      { label: "Reward Tier", value: "Gold", detail: "320 pts to Platinum" },
      { label: "Watched Events", value: "38", detail: "Season total" },
    ],
    primaryPanel: {
      title: "Event Discovery",
      action: "View Schedule",
      items: [
        {
          title: "Emerald Stakes",
          meta: "Today, 14:30 - Royal Turf Club",
          tags: ["1,600m", "Turf", "12 horses"],
        },
        {
          title: "Golden Mile Cup",
          meta: "Today, 15:15 - Sunshine Racecourse",
          tags: ["1,600m", "Turf", "Open odds"],
        },
        {
          title: "Thunderbolt Sprint",
          meta: "Tomorrow, 16:00 - Valley Racecourse",
          tags: ["1,200m", "Dirt", "8 horses"],
        },
      ],
    },
    livePanel: {
      title: "Race Engagement",
      status: "Live",
      race: "Race 4 - Emerald Stakes",
      progress: 68,
      rows: [
        ["1", "Silver Bullet", "L. O'Connor", "1:12.44"],
        ["2", "Emerald Dream", "S. Martinez", "+0.8s"],
        ["3", "Thunder King", "N. Henderson", "+1.4s"],
      ],
    },
    prediction: {
      title: "Race Prediction",
      race: "Golden Mile Cup",
      closing: "Closes in 18 min",
      picks: ["Emerald Dream", "Royal Phantom", "Midnight Runner"],
    },
    rewards: [
      { title: "Latest Reward", value: "+120 pts", note: "Correct winner pick" },
      { title: "History", value: "18 claims", note: "5 rewards this month" },
      { title: "Notification", value: "2 new", note: "Reward updates waiting" },
    ],
  },
  Jockey: {
    background: "/jockey-dashboard-bg.png",
    eyebrow: "Jockey Workspace",
    title: "Professional racing dashboard",
    subtitle:
      "Manage your portfolio, invitations, race assignments, career metrics, and performance results.",
    accent: "Season rank #7",
    stats: [
      { label: "Win Rate", value: "24%", detail: "+3.2% vs last season" },
      { label: "Career Wins", value: "120", detail: "18 this season" },
      { label: "Assignments", value: "6", detail: "Next 14 days" },
      { label: "Prize Money", value: "$420K", detail: "Season earned" },
    ],
    primaryPanel: {
      title: "Invitation Management",
      action: "Review Invites",
      items: [
        {
          title: "Greenfield Stable",
          meta: "Ride Silver Bullet in Emerald Stakes",
          tags: ["Pending", "$8.5K purse", "Today"],
        },
        {
          title: "Skyline Racing",
          meta: "Ride Emerald Dream in Golden Mile Cup",
          tags: ["Accepted", "$12K purse", "Turf"],
        },
        {
          title: "Royal Bloodstock",
          meta: "Ride Thunder King in Champion's Cup",
          tags: ["Pending", "$25K purse", "Sunday"],
        },
      ],
    },
    livePanel: {
      title: "Race Assignment Tracking",
      status: "Assigned",
      race: "Race 4 - Emerald Stakes",
      progress: 42,
      rows: [
        ["Horse", "Silver Bullet", "Gate 4", "Ready"],
        ["Venue", "Royal Turf Club", "Turf", "14:30"],
        ["Distance", "1,600m", "Weight 52kg", "Clear"],
      ],
    },
    prediction: {
      title: "Professional Portfolio",
      race: "Profile Readiness",
      closing: "Updated 2 days ago",
      picks: ["12 years experience", "52kg racing weight", "Turf specialist"],
    },
    rewards: [
      { title: "Career Statistics", value: "96.8", note: "Performance rating" },
      { title: "Analytics", value: "Top 9%", note: "Fast finish split" },
      { title: "Recent Result", value: "2nd", note: "Sunshine Cup finish" },
    ],
  },
};

function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    logo: (
      <>
        <path d="M7 20c0-7 3-10 8-12l2-4 1 6c2 2 3 4 3 7v3" />
        <path d="M7 20h9c2 0 3-1 3-3" />
        <path d="M10 10 5 6" />
        <path d="M15 12h.01" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20V8" />
      </>
    ),
    calendar: (
      <>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />
        <path d="M5 6H3v3a4 4 0 0 0 4 4" />
        <path d="M19 6h2v3a4 4 0 0 1-4 4" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function DashboardCard({ children, className = "" }) {
  return <section className={`role-dashboard-card ${className}`}>{children}</section>;
}

export default function RoleHome({ allowedRole }) {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const user = authSession?.user || {
    fullName: allowedRole,
    email: `${allowedRole.toLowerCase().replace(/\s+/g, "-")}@goldenhoof.local`,
    role: allowedRole,
  };
  const data = roleData[allowedRole];

  function handleLogout() {
    clearAuthSession();
    navigate("/", { replace: true });
  }

  const profilePath = allowedRole === "Jockey" ? "/jockey/profile" : "/profile";

  return (
    <main
      className="role-dashboard-page"
      style={{ "--role-bg": `url("${data.background}")` }}
    >
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f7fffd;
          color: #0d2321;
        }
        a { color: inherit; text-decoration: none; }
        button { font: inherit; }

        .role-dashboard-page {
          min-height: 100dvh;
          background:
            linear-gradient(90deg, rgba(0, 45, 40, 0.97), rgba(0, 79, 70, 0.9) 42%, rgba(0, 45, 40, 0.52)),
            var(--role-bg) center right / cover fixed;
          color: #f4fffb;
        }

        .role-shell {
          width: min(1220px, calc(100% - 40px));
          margin: 0 auto;
          padding: 28px 0 42px;
        }

        .role-topbar {
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
          border-bottom: 1px solid rgba(105, 248, 221, 0.2);
        }

        .role-brand,
        .role-user-nav,
        .role-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .role-brand {
          font-size: 24px;
          font-weight: 950;
        }

        .role-brand svg,
        .role-eyebrow,
        .role-card-icon,
        .role-panel-action {
          color: #69f8dd;
        }

        .role-user-nav {
          color: rgba(244, 255, 251, 0.8);
          font-size: 14px;
          font-weight: 850;
        }

        .role-btn {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 16px;
          border: 1px solid rgba(105, 248, 221, 0.38);
          border-radius: 8px;
          color: #f4fffb;
          background: rgba(255, 255, 255, 0.04);
          font-weight: 900;
          cursor: pointer;
        }

        .role-btn-primary {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
        }

        .role-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
          gap: 22px;
          align-items: stretch;
          margin-bottom: 22px;
        }

        .role-hero-copy {
          min-height: 330px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 34px;
          border: 1px solid rgba(105, 248, 221, 0.22);
          border-radius: 8px;
          background: rgba(0, 45, 40, 0.72);
          backdrop-filter: blur(16px);
        }

        .role-eyebrow {
          width: max-content;
          margin-bottom: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(105, 248, 221, 0.14);
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .role-hero h1 {
          max-width: 780px;
          margin: 0;
          font-size: clamp(40px, 6vw, 68px);
          line-height: 1.03;
          font-weight: 950;
          letter-spacing: 0;
        }

        .role-hero p {
          max-width: 720px;
          margin: 20px 0 0;
          color: rgba(244, 255, 251, 0.78);
          font-size: 18px;
          line-height: 1.62;
        }

        .role-dashboard-card {
          border: 1px solid rgba(105, 248, 221, 0.2);
          border-radius: 8px;
          background: rgba(0, 45, 40, 0.86);
          backdrop-filter: blur(16px);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
        }

        .role-profile-card {
          min-height: 330px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .role-avatar {
          width: 68px;
          height: 68px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 50%;
          color: #06332e;
          background: #69f8dd;
          font-size: 22px;
          font-weight: 950;
        }

        .role-profile-card h2 {
          margin: 0 0 8px;
          font-size: 25px;
          line-height: 1.15;
          font-weight: 950;
        }

        .role-muted {
          color: rgba(244, 255, 251, 0.68);
        }

        .role-accent {
          margin-top: 20px;
          padding: 14px;
          border-radius: 8px;
          color: #06332e;
          background: #d9fbf4;
          font-weight: 950;
        }

        .role-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .role-stat {
          min-height: 138px;
          padding: 20px;
        }

        .role-stat span {
          display: block;
          color: rgba(244, 255, 251, 0.68);
          font-size: 13px;
          font-weight: 850;
        }

        .role-stat strong {
          display: block;
          margin: 12px 0 8px;
          font-size: 34px;
          line-height: 1;
          color: #69f8dd;
          font-weight: 950;
        }

        .role-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.72fr);
          gap: 22px;
        }

        .role-panel {
          padding: 22px;
        }

        .role-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .role-panel-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .role-panel h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 950;
        }

        .role-panel-action {
          border: 0;
          background: transparent;
          font-weight: 950;
          cursor: pointer;
        }

        .role-list {
          display: grid;
          gap: 12px;
        }

        .role-list-item {
          padding: 16px;
          border: 1px solid rgba(105, 248, 221, 0.18);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.045);
        }

        .role-list-item strong {
          display: block;
          margin-bottom: 6px;
          font-size: 17px;
        }

        .role-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .role-tag {
          padding: 6px 9px;
          border-radius: 999px;
          color: #06332e;
          background: #d9fbf4;
          font-size: 12px;
          font-weight: 950;
        }

        .role-live-card {
          padding: 22px;
        }

        .role-status {
          padding: 7px 11px;
          border-radius: 999px;
          color: #06332e;
          background: #69f8dd;
          font-size: 12px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .role-progress {
          height: 10px;
          margin: 18px 0;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(244, 255, 251, 0.16);
        }

        .role-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #69f8dd;
        }

        .role-table {
          display: grid;
          gap: 8px;
        }

        .role-table-row {
          display: grid;
          grid-template-columns: 0.45fr 1.2fr 0.9fr 0.7fr;
          gap: 10px;
          align-items: center;
          min-height: 42px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(244, 255, 251, 0.78);
          font-size: 13px;
          font-weight: 850;
        }

        .role-side-stack {
          display: grid;
          gap: 22px;
        }

        .role-mini-list {
          display: grid;
          gap: 10px;
          margin-top: 16px;
        }

        .role-mini-list div,
        .role-reward {
          padding: 13px;
          border-radius: 8px;
          color: #06332e;
          background: #d9fbf4;
          font-weight: 950;
        }

        .role-rewards {
          display: grid;
          gap: 10px;
        }

        .role-reward strong {
          display: block;
          font-size: 24px;
        }

        .role-reward span {
          display: block;
          margin-top: 5px;
          color: rgba(6, 51, 46, 0.7);
          font-size: 13px;
        }

        @media (max-width: 980px) {
          .role-hero,
          .role-grid,
          .role-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .role-shell {
            width: min(100% - 28px, 1220px);
            padding-top: 18px;
          }
          .role-topbar,
          .role-actions {
            align-items: flex-start;
            flex-direction: column;
          }
          .role-hero-copy,
          .role-profile-card,
          .role-panel,
          .role-live-card {
            padding: 18px;
          }
          .role-hero h1 {
            font-size: clamp(36px, 12vw, 52px);
          }
          .role-table-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="role-shell">
        <header className="role-topbar">
          <Link className="role-brand" to="/">
            <Icon name="logo" size={32} />
            <span>GoldenHoof</span>
          </Link>
          <nav className="role-user-nav" aria-label="Role navigation">
            <Link to="/home">Races</Link>
            <Link to={profilePath}>Profile</Link>
            <button className="role-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>

        <section className="role-hero">
          <div className="role-hero-copy">
            <span className="role-eyebrow">{data.eyebrow}</span>
            <h1>{data.title}</h1>
            <p>{data.subtitle}</p>
            <div className="role-actions" style={{ marginTop: 26 }}>
              <Link className="role-btn role-btn-primary" to="/home">
                Explore Races
              </Link>
              <Link className="role-btn" to={profilePath}>
                Open Profile
              </Link>
            </div>
          </div>

          <DashboardCard className="role-profile-card">
            <div>
              <div className="role-avatar">
                {(user.fullName || user.name || user.email || allowedRole)
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h2>{user.fullName || user.name || user.email}</h2>
              <div className="role-muted">{user.email}</div>
            </div>
            <div className="role-accent">{data.accent}</div>
          </DashboardCard>
        </section>

        <section className="role-stats" aria-label={`${allowedRole} statistics`}>
          {data.stats.map((stat) => (
            <DashboardCard className="role-stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <div className="role-muted">{stat.detail}</div>
            </DashboardCard>
          ))}
        </section>

        <section className="role-grid">
          <div className="role-side-stack">
            <DashboardCard className="role-panel">
              <div className="role-panel-header">
                <div className="role-panel-title">
                  <span className="role-card-icon">
                    <Icon name="calendar" />
                  </span>
                  <h2>{data.primaryPanel.title}</h2>
                </div>
                <button className="role-panel-action" type="button">
                  {data.primaryPanel.action}
                </button>
              </div>

              <div className="role-list">
                {data.primaryPanel.items.map((item) => (
                  <article className="role-list-item" key={item.title}>
                    <strong>{item.title}</strong>
                    <div className="role-muted">{item.meta}</div>
                    <div className="role-tags">
                      {item.tags.map((tag) => (
                        <span className="role-tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard className="role-live-card">
              <div className="role-panel-header">
                <div className="role-panel-title">
                  <span className="role-card-icon">
                    <Icon name="chart" />
                  </span>
                  <h2>{data.livePanel.title}</h2>
                </div>
                <span className="role-status">{data.livePanel.status}</span>
              </div>
              <strong>{data.livePanel.race}</strong>
              <div className="role-progress" aria-hidden="true">
                <span style={{ width: `${data.livePanel.progress}%` }} />
              </div>
              <div className="role-table">
                {data.livePanel.rows.map((row) => (
                  <div className="role-table-row" key={row.join("-")}>
                    {row.map((cell) => (
                      <span key={cell}>{cell}</span>
                    ))}
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          <div className="role-side-stack">
            <DashboardCard className="role-panel">
              <div className="role-panel-title">
                <span className="role-card-icon">
                  <Icon name="trophy" />
                </span>
                <h2>{data.prediction.title}</h2>
              </div>
              <p className="role-muted" style={{ marginTop: 12 }}>
                {data.prediction.race} - {data.prediction.closing}
              </p>
              <div className="role-mini-list">
                {data.prediction.picks.map((pick) => (
                  <div key={pick}>{pick}</div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard className="role-panel">
              <div className="role-panel-title" style={{ marginBottom: 16 }}>
                <span className="role-card-icon">
                  <Icon name="chart" />
                </span>
                <h2>{allowedRole === "Spectator" ? "Reward System" : "Performance Analytics"}</h2>
              </div>
              <div className="role-rewards">
                {data.rewards.map((reward) => (
                  <div className="role-reward" key={reward.title}>
                    <span>{reward.title}</span>
                    <strong>{reward.value}</strong>
                    <span>{reward.note}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </section>
      </div>
    </main>
  );
}
