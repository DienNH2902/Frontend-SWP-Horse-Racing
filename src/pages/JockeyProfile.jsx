import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthSession } from "../utils/storage";

const JOCKEY_INVITATIONS_STORAGE_KEY = "goldenhoof_jockey_invitations";
const JOCKEY_PROFILE_STORAGE_KEY = "goldenhoof_jockey_profile";

const profileStats = [
  { label: "Win Rate", value: "24%", note: "18 wins this season" },
  { label: "Career Wins", value: "120", note: "426 career starts" },
  { label: "Season Rank", value: "#7", note: "National jockey board" },
  { label: "Prize Money", value: "$420K", note: "Season earnings" },
];

const achievements = [
  "Emerald Stakes winner - 2026",
  "Top 10 national jockey ranking",
  "Fastest final split at Valley Racecourse",
  "Royal Turf Club sportsmanship award",
];

const raceHistory = [
  {
    race: "Sunshine Cup",
    horse: "Emerald Dream",
    result: "2nd",
    prize: "$18,000",
  },
  {
    race: "Rapid Dash",
    horse: "Thunder King",
    result: "1st",
    prize: "$24,000",
  },
  {
    race: "Morning Sprint",
    horse: "Speed Demon",
    result: "4th",
    prize: "$5,500",
  },
];

const defaultCurrentAssignments = [
  {
    inviteId: "skyline-emerald-dream",
    status: "Accepted",
    race: "Golden Mile Cup",
    horse: "Emerald Dream",
    venue: "Sunshine Racecourse",
    time: "Today, 15:15",
  },
];

function getCurrentAssignments() {
  try {
    const stored = window.localStorage.getItem(JOCKEY_INVITATIONS_STORAGE_KEY);
    const invitations = stored ? JSON.parse(stored) : defaultCurrentAssignments;

    return invitations.filter((invitation) => invitation.status === "Accepted");
  } catch {
    return defaultCurrentAssignments;
  }
}

function createDefaultJockeyProfile(user) {
  return {
    fullName: user.fullName || user.name || user.email || "GoldenHoof Jockey",
    professionalTitle: "Active professional jockey",
    experience: "12 years experience",
    height: "168 cm",
    weight: "52 kg",
    preferredSurface: "Turf",
    racingLicense: "Active - Pro Class",
    homeTrack: "Royal Turf Club",
    specialty: "Turf specialist",
    bio:
      "Focused on controlled starts, efficient pacing, and fast final furlong execution across premium turf events.",
  };
}

function getStoredJockeyProfile(user) {
  try {
    const stored = window.localStorage.getItem(JOCKEY_PROFILE_STORAGE_KEY);

    return stored ? JSON.parse(stored) : createDefaultJockeyProfile(user);
  } catch {
    return createDefaultJockeyProfile(user);
  }
}

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
    medal: (
      <>
        <path d="M8 2h8l-2 7h-4L8 2Z" />
        <circle cx="12" cy="15" r="5" />
        <path d="m10.5 15 1 1 2-2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 22a8 8 0 0 1 16 0" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function Card({ children, className = "" }) {
  return <section className={`jockey-profile-card ${className}`}>{children}</section>;
}

export default function JockeyProfile() {
  const navigate = useNavigate();
  const authSession = getAuthSession();
  const user = authSession?.user || {};
  const currentAssignments = getCurrentAssignments();
  const [isEditing, setIsEditing] = useState(false);
  const [jockeyProfile, setJockeyProfile] = useState(() =>
    getStoredJockeyProfile(user),
  );

  if (!authSession) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "Jockey") {
    return <Navigate to="/home" replace />;
  }

  const displayName = jockeyProfile.fullName || "GoldenHoof Jockey";
  const physicalProfile = [
    ["Height", jockeyProfile.height],
    ["Weight", jockeyProfile.weight],
    ["Preferred Surface", jockeyProfile.preferredSurface],
    ["Racing License", jockeyProfile.racingLicense],
  ];

  function handleLogout() {
    clearAuthSession();
    navigate("/home", { replace: true });
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setJockeyProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  }

  function handleSaveProfile(event) {
    event.preventDefault();
    window.localStorage.setItem(
      JOCKEY_PROFILE_STORAGE_KEY,
      JSON.stringify(jockeyProfile),
    );
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setJockeyProfile(getStoredJockeyProfile(user));
    setIsEditing(false);
  }

  return (
    <main className="jockey-profile-page">
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

        .jockey-profile-page {
          min-height: 100dvh;
          color: #f4fffb;
          background:
            linear-gradient(90deg, rgba(0, 45, 40, 0.98), rgba(0, 72, 64, 0.9) 45%, rgba(0, 45, 40, 0.54)),
            url("/jockey-dashboard-bg.png") center right / cover fixed;
        }

        .jockey-profile-shell {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
          padding: 28px 0 44px;
        }

        .jockey-profile-topbar {
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 26px;
          border-bottom: 1px solid rgba(105, 248, 221, 0.2);
        }

        .jockey-profile-brand,
        .jockey-profile-nav,
        .jockey-profile-actions,
        .jockey-profile-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .jockey-profile-brand {
          font-size: 24px;
          font-weight: 950;
        }

        .jockey-profile-brand svg,
        .jockey-profile-kicker,
        .jockey-profile-icon {
          color: #69f8dd;
        }

        .jockey-profile-nav {
          color: rgba(244, 255, 251, 0.8);
          font-size: 14px;
          font-weight: 850;
        }

        .jockey-profile-btn {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          border: 1px solid rgba(105, 248, 221, 0.38);
          border-radius: 8px;
          color: #f4fffb;
          background: rgba(255, 255, 255, 0.04);
          font-weight: 900;
          cursor: pointer;
        }

        .jockey-profile-btn-primary {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
        }

        .jockey-profile-btn-danger {
          border-color: rgba(255, 255, 255, 0.18);
          color: #f4fffb;
          background: rgba(255, 255, 255, 0.02);
        }

        .jockey-profile-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
          gap: 22px;
          margin-bottom: 22px;
        }

        .jockey-profile-intro {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 34px;
          border: 1px solid rgba(105, 248, 221, 0.22);
          border-radius: 8px;
          background: rgba(0, 45, 40, 0.74);
          backdrop-filter: blur(16px);
        }

        .jockey-profile-kicker {
          width: max-content;
          margin-bottom: 14px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(105, 248, 221, 0.14);
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .jockey-profile-intro h1 {
          margin: 0;
          font-size: clamp(40px, 6vw, 64px);
          line-height: 1.04;
          font-weight: 950;
          letter-spacing: 0;
        }

        .jockey-profile-intro p {
          max-width: 680px;
          margin: 18px 0 0;
          color: rgba(244, 255, 251, 0.78);
          font-size: 17px;
          line-height: 1.62;
        }

        .jockey-profile-card {
          border: 1px solid rgba(105, 248, 221, 0.2);
          border-radius: 8px;
          background: rgba(0, 45, 40, 0.86);
          backdrop-filter: blur(16px);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
        }

        .jockey-profile-edit {
          padding: 22px;
          margin-bottom: 22px;
        }

        .jockey-profile-form {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .jockey-profile-field {
          display: grid;
          gap: 8px;
        }

        .jockey-profile-field-wide {
          grid-column: 1 / -1;
        }

        .jockey-profile-field label {
          color: rgba(244, 255, 251, 0.82);
          font-size: 13px;
          font-weight: 950;
        }

        .jockey-profile-input,
        .jockey-profile-textarea {
          width: 100%;
          border: 1px solid rgba(105, 248, 221, 0.28);
          border-radius: 8px;
          color: #f4fffb;
          background: rgba(255, 255, 255, 0.055);
          outline: none;
          font: inherit;
          font-weight: 850;
        }

        .jockey-profile-input {
          min-height: 44px;
          padding: 0 13px;
        }

        .jockey-profile-textarea {
          min-height: 104px;
          resize: vertical;
          padding: 12px 13px;
          line-height: 1.5;
        }

        .jockey-profile-input:focus,
        .jockey-profile-textarea:focus {
          border-color: #69f8dd;
          box-shadow: 0 0 0 3px rgba(105, 248, 221, 0.14);
        }

        .jockey-profile-form-actions {
          grid-column: 1 / -1;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }

        .jockey-profile-summary {
          min-height: 360px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .jockey-profile-avatar {
          width: 76px;
          height: 76px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          border-radius: 50%;
          color: #06332e;
          background: #69f8dd;
          font-size: 24px;
          font-weight: 950;
        }

        .jockey-profile-summary h2 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 950;
        }

        .jockey-profile-muted {
          color: rgba(244, 255, 251, 0.68);
        }

        .jockey-profile-license {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }

        .jockey-profile-license div {
          padding: 13px;
          border-radius: 8px;
          color: #06332e;
          background: #d9fbf4;
          font-weight: 950;
        }

        .jockey-profile-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .jockey-profile-stat {
          min-height: 132px;
          padding: 20px;
        }

        .jockey-profile-stat span {
          display: block;
          color: rgba(244, 255, 251, 0.68);
          font-size: 13px;
          font-weight: 850;
        }

        .jockey-profile-stat strong {
          display: block;
          margin: 12px 0 8px;
          color: #69f8dd;
          font-size: 34px;
          line-height: 1;
          font-weight: 950;
        }

        .jockey-profile-grid {
          display: grid;
          grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
          gap: 22px;
        }

        .jockey-profile-panel {
          padding: 22px;
        }

        .jockey-profile-title-row {
          margin-bottom: 18px;
        }

        .jockey-profile-panel h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 950;
        }

        .jockey-profile-info-list,
        .jockey-profile-assignments,
        .jockey-profile-achievements,
        .jockey-profile-table {
          display: grid;
          gap: 10px;
        }

        .jockey-profile-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 13px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
        }

        .jockey-profile-info span:first-child {
          color: rgba(244, 255, 251, 0.68);
          font-size: 13px;
          font-weight: 850;
        }

        .jockey-profile-info span:last-child {
          font-weight: 950;
          text-align: right;
        }

        .jockey-profile-achievements li {
          padding: 13px;
          border-radius: 8px;
          color: #06332e;
          background: #d9fbf4;
          font-weight: 950;
          list-style: none;
        }

        .jockey-profile-achievements {
          padding: 0;
          margin: 0;
        }

        .jockey-profile-assignment {
          padding: 14px;
          border-radius: 8px;
          color: #06332e;
          background: #d9fbf4;
        }

        .jockey-profile-assignment strong,
        .jockey-profile-assignment span {
          display: block;
        }

        .jockey-profile-assignment strong {
          font-size: 16px;
          font-weight: 950;
        }

        .jockey-profile-assignment span {
          margin-top: 5px;
          color: rgba(6, 51, 46, 0.72);
          font-size: 13px;
          font-weight: 850;
        }

        .jockey-profile-race-row {
          display: grid;
          grid-template-columns: minmax(130px, 1.2fr) minmax(120px, 1fr) 0.5fr 0.7fr;
          gap: 12px;
          align-items: center;
          min-height: 52px;
          padding: 13px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(244, 255, 251, 0.78);
          font-size: 13px;
          font-weight: 850;
        }

        .jockey-profile-race-row strong {
          color: #f4fffb;
          font-size: 14px;
        }

        @media (max-width: 980px) {
          .jockey-profile-hero,
          .jockey-profile-grid,
          .jockey-profile-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .jockey-profile-shell {
            width: min(100% - 28px, 1180px);
            padding-top: 18px;
          }
          .jockey-profile-topbar,
          .jockey-profile-nav,
          .jockey-profile-actions {
            align-items: flex-start;
            flex-direction: column;
          }
          .jockey-profile-intro,
          .jockey-profile-summary,
          .jockey-profile-panel {
            padding: 18px;
          }
          .jockey-profile-intro h1 {
            font-size: clamp(36px, 12vw, 52px);
          }
          .jockey-profile-race-row,
          .jockey-profile-info,
          .jockey-profile-form {
            grid-template-columns: 1fr;
          }
          .jockey-profile-field-wide,
          .jockey-profile-form-actions {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="jockey-profile-shell">
        <header className="jockey-profile-topbar">
          <Link className="jockey-profile-brand" to="/home">
            <img className="jockey-profile-brand-logo" src="/goldenhoof-logo.png" alt="" />
            <span>GoldenHoof</span>
          </Link>
          <nav className="jockey-profile-nav" aria-label="Jockey profile navigation">
            <Link to="/jockey">Dashboard</Link>
            <Link to="/home">Races</Link>
            <button className="jockey-profile-btn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>

        <section className="jockey-profile-hero">
          <div className="jockey-profile-intro">
            <span className="jockey-profile-kicker">Professional Portfolio</span>
            <h1>Jockey profile</h1>
            <p>
              Manage racing identity, physical details, competition experience,
              achievements, and performance history from one dedicated workspace.
            </p>
            <div className="jockey-profile-actions" style={{ marginTop: 26 }}>
              <button
                className="jockey-profile-btn jockey-profile-btn-primary"
                type="button"
                onClick={() => setIsEditing(true)}
              >
                {isEditing ? "Editing Profile" : "Edit Profile"}
              </button>
              <Link className="jockey-profile-btn" to="/jockey">
                Back to Dashboard
              </Link>
            </div>
          </div>

          <Card className="jockey-profile-summary">
            <div>
              <div className="jockey-profile-avatar">
                {displayName
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h2>{displayName}</h2>
              <div className="jockey-profile-muted">{user.email}</div>
              <p className="jockey-profile-muted" style={{ marginTop: 14 }}>
                {jockeyProfile.bio}
              </p>
            </div>
            <div className="jockey-profile-license">
              <div>{jockeyProfile.professionalTitle}</div>
              <div>
                {jockeyProfile.specialty} - {jockeyProfile.homeTrack}
              </div>
            </div>
          </Card>
        </section>

        {isEditing && (
          <Card className="jockey-profile-edit">
            <div className="jockey-profile-title-row">
              <span className="jockey-profile-icon">
                <Icon name="user" />
              </span>
              <h2>Edit Professional Profile</h2>
            </div>
            <form className="jockey-profile-form" onSubmit={handleSaveProfile}>
              <div className="jockey-profile-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  className="jockey-profile-input"
                  id="fullName"
                  name="fullName"
                  value={jockeyProfile.fullName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field">
                <label htmlFor="professionalTitle">Professional Title</label>
                <input
                  className="jockey-profile-input"
                  id="professionalTitle"
                  name="professionalTitle"
                  value={jockeyProfile.professionalTitle}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field">
                <label htmlFor="experience">Experience</label>
                <input
                  className="jockey-profile-input"
                  id="experience"
                  name="experience"
                  value={jockeyProfile.experience}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field">
                <label htmlFor="racingLicense">Racing License</label>
                <input
                  className="jockey-profile-input"
                  id="racingLicense"
                  name="racingLicense"
                  value={jockeyProfile.racingLicense}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field">
                <label htmlFor="height">Height</label>
                <input
                  className="jockey-profile-input"
                  id="height"
                  name="height"
                  value={jockeyProfile.height}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field">
                <label htmlFor="weight">Weight</label>
                <input
                  className="jockey-profile-input"
                  id="weight"
                  name="weight"
                  value={jockeyProfile.weight}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field">
                <label htmlFor="preferredSurface">Preferred Surface</label>
                <input
                  className="jockey-profile-input"
                  id="preferredSurface"
                  name="preferredSurface"
                  value={jockeyProfile.preferredSurface}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field">
                <label htmlFor="homeTrack">Home Track</label>
                <input
                  className="jockey-profile-input"
                  id="homeTrack"
                  name="homeTrack"
                  value={jockeyProfile.homeTrack}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field jockey-profile-field-wide">
                <label htmlFor="specialty">Specialty</label>
                <input
                  className="jockey-profile-input"
                  id="specialty"
                  name="specialty"
                  value={jockeyProfile.specialty}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-field jockey-profile-field-wide">
                <label htmlFor="bio">Profile Bio</label>
                <textarea
                  className="jockey-profile-textarea"
                  id="bio"
                  name="bio"
                  value={jockeyProfile.bio}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="jockey-profile-form-actions">
                <button
                  className="jockey-profile-btn jockey-profile-btn-primary"
                  type="submit"
                >
                  Save Changes
                </button>
                <button
                  className="jockey-profile-btn jockey-profile-btn-danger"
                  type="button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Card>
        )}

        <section className="jockey-profile-stats" aria-label="Jockey career statistics">
          {profileStats.map((stat) => (
            <Card className="jockey-profile-stat" key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <div className="jockey-profile-muted">{stat.note}</div>
            </Card>
          ))}
        </section>

        <section className="jockey-profile-grid">
          <div className="jockey-profile-side">
            <Card className="jockey-profile-panel">
              <div className="jockey-profile-title-row">
                <span className="jockey-profile-icon">
                  <Icon name="chart" />
                </span>
                <h2>Current Race Assignments</h2>
              </div>
              <div className="jockey-profile-assignments">
                {currentAssignments.map((assignment) => (
                  <article className="jockey-profile-assignment" key={assignment.inviteId}>
                    <strong>{assignment.race}</strong>
                    <span>
                      {assignment.horse} - {assignment.venue}
                    </span>
                    <span>{assignment.time}</span>
                  </article>
                ))}
              </div>
            </Card>

            <Card className="jockey-profile-panel" style={{ marginTop: 22 }}>
              <div className="jockey-profile-title-row">
                <span className="jockey-profile-icon">
                  <Icon name="user" />
                </span>
                <h2>Physical Information</h2>
              </div>
              <div className="jockey-profile-info-list">
                {physicalProfile.map(([label, value]) => (
                  <div className="jockey-profile-info" key={label}>
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
              <div className="jockey-profile-info" style={{ marginTop: 10 }}>
                <span>Experience</span>
                <span>{jockeyProfile.experience}</span>
              </div>
            </Card>

            <Card className="jockey-profile-panel" style={{ marginTop: 22 }}>
              <div className="jockey-profile-title-row">
                <span className="jockey-profile-icon">
                  <Icon name="medal" />
                </span>
                <h2>Achievements</h2>
              </div>
              <ul className="jockey-profile-achievements">
                {achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="jockey-profile-panel">
            <div className="jockey-profile-title-row">
              <span className="jockey-profile-icon">
                <Icon name="chart" />
              </span>
              <h2>Performance History</h2>
            </div>
            <div className="jockey-profile-table">
              {raceHistory.map((race) => (
                <article className="jockey-profile-race-row" key={race.race}>
                  <strong>{race.race}</strong>
                  <span>{race.horse}</span>
                  <span>{race.result}</span>
                  <span>{race.prize}</span>
                </article>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
