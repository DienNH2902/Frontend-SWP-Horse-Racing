import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHomePageData } from "../api/services/home.service";
import { getRoleHomePath } from "../utils/roles";
import { clearAuthSession, getAccessToken, getAuthSession } from "../utils/storage";

function Icon({ name, size = 24 }) {
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
        <path d="M11 15h5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 5 7 7-7 7" />
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
    horse: (
      <>
        <path d="M4 18v-5l4-4 5 1 3-3 4 4-3 2v5" />
        <path d="M8 14v4" />
        <path d="M13 14v4" />
        <path d="M16 8V4" />
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
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    map: (
      <>
        <path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </>
    ),
    crown: (
      <>
        <path d="m3 8 4 8 5-10 5 10 4-8v11H3V8Z" />
        <path d="M3 21h18" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    logout: (
      <>
        <path d="M10 17 15 12l-5-5" />
        <path d="M15 12H3" />
        <path d="M21 3v18" />
      </>
    ),
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="8" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="15" width="7" height="6" rx="1" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10" />
        <path d="M10 20v-6h4v6" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function SectionTitle({ title, action }) {
  return (
    <div className="home-section-title">
      <h2>{title}</h2>
      {action && (
        <a href={action.href}>
          {action.label}
          <Icon name="arrow" size={16} />
        </a>
      )}
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="home-stat">
      <Icon name={icon} size={30} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Avatar({ name, rank }) {
  return (
    <span className={`home-avatar home-avatar-${rank}`}>
      {name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}

function decodeJwtClaims(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );
    const json = decodeURIComponent(
      atob(paddedPayload)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function pickFirstValue(source, keys) {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }

  return null;
}

function Home() {
  const [authSession, setAuthSession] = useState(() => getAuthSession());
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [homeData, setHomeData] = useState({
    races: [],
    horses: [],
    jockeys: [],
    standings: [],
    results: [],
    predictors: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getHomePageData()
      .then((data) => {
        if (isMounted) {
          setHomeData(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    setAuthSession(null);
    setIsAccountMenuOpen(false);
  }

  const tokenClaims = decodeJwtClaims(getAccessToken());
  const currentUser = authSession?.user || {};
  const accountName =
    pickFirstValue(currentUser, ["fullName", "name", "displayName", "username", "email"]) ||
    pickFirstValue(tokenClaims, ["fullName", "name", "displayName", "username", "email", "sub"]) ||
    "Account";
  const accountRole =
    pickFirstValue(currentUser, ["role", "roleName"]) ||
    pickFirstValue(tokenClaims, ["role", "roleName", "roles", "authorities"]) ||
    "";
  const primaryRole = Array.isArray(accountRole) ? accountRole[0] : accountRole;
  const dashboardPath = getRoleHomePath(primaryRole);
  const isAdmin = Array.isArray(accountRole)
    ? accountRole.some((role) => String(role).toLowerCase().includes("admin"))
    : String(accountRole).toLowerCase().includes("admin");

  return (
    <main className="home-page">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { min-height: 100%; margin: 0; }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #0d2321;
          background: #f7fffd;
        }
        button, input { font: inherit; }
        a { color: inherit; text-decoration: none; }

        .home-page {
          min-height: 100dvh;
          overflow-x: hidden;
          background: #f7fffd;
        }

        .home-nav {
          position: fixed;
          z-index: 20;
          inset: 0 0 auto;
          height: 86px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(105, 248, 221, 0.22);
          color: #f4fffb;
          background: rgba(0, 45, 40, 0.82);
          backdrop-filter: blur(18px);
        }

        .home-container {
          width: min(1230px, calc(100% - 44px));
          margin: 0 auto;
        }

        .home-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }

        .home-brand,
        .home-footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 0;
          flex: 0 0 auto;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 0;
          white-space: nowrap;
        }

        .home-brand-logo {
          height: 78px;
          width: auto;
          display: block;
        }

        .home-brand svg,
        .home-footer-brand svg {
          color: #5ef8d8;
        }

        .home-menu {
          display: flex;
          align-items: center;
          gap: clamp(18px, 2.1vw, 34px);
          color: rgba(244, 255, 251, 0.88);
          font-size: 14px;
          font-weight: 800;
        }

        .home-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .home-icon-btn {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border: 0;
          color: #f4fffb;
          background: transparent;
          cursor: pointer;
        }

        .home-btn {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 0 24px;
          border: 1px solid rgba(94, 248, 216, 0.55);
          border-radius: 8px;
          color: #f4fffb;
          background: rgba(255, 255, 255, 0.04);
          font-weight: 900;
          cursor: pointer;
        }

        .home-btn-primary {
          border-color: transparent;
          color: #062724;
          background: #69f8dd;
        }

        .account-menu {
          position: relative;
        }

        .account-trigger {
          min-width: 210px;
          max-width: 320px;
          justify-content: space-between;
          font-size: 14px;
        }

        .account-trigger-name {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .account-trigger svg:last-child {
          transition: transform 0.18s ease;
        }

        .account-trigger-open svg:last-child {
          transform: rotate(180deg);
        }

        .account-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 190px;
          padding: 8px;
          border: 1px solid rgba(105, 248, 221, 0.22);
          border-radius: 8px;
          background: rgba(0, 45, 40, 0.96);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
        }

        .account-menu-item {
          width: 100%;
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          border: 0;
          border-radius: 6px;
          color: #f4fffb;
          background: transparent;
          font-weight: 850;
          cursor: pointer;
        }

        .account-menu-item:hover {
          background: rgba(105, 248, 221, 0.12);
        }

        .account-menu-logout {
          color: #ffd9d9;
        }

        .home-hero {
          min-height: 720px;
          display: flex;
          align-items: center;
          color: #f4fffb;
          background-image:
            linear-gradient(90deg, rgba(0, 35, 32, 0.96) 0%, rgba(0, 48, 43, 0.82) 36%, rgba(0, 37, 35, 0.3) 69%, rgba(0, 28, 27, 0.25) 100%),
            linear-gradient(0deg, rgba(0, 21, 20, 0.22), rgba(0, 21, 20, 0.18)),
            url("/goldenhoof-hero.png");
          background-size: cover;
          background-position: center right;
        }

        .home-hero-content {
          width: min(610px, 100%);
          padding-top: 80px;
        }

        .home-kicker {
          width: max-content;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 26px;
          padding: 9px 18px;
          border-radius: 999px;
          color: #69f8dd;
          background: rgba(96, 248, 218, 0.14);
          font-size: 14px;
          font-weight: 950;
        }

        .home-kicker::before {
          content: "";
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #69f8dd;
        }

        .home-hero h1 {
          margin: 0;
          font-size: clamp(48px, 6vw, 76px);
          line-height: 1.06;
          font-weight: 950;
          letter-spacing: 0;
        }

        .home-hero h1 span {
          display: block;
          color: #69f8dd;
        }

        .home-hero p {
          max-width: 560px;
          margin: 28px 0 32px;
          color: rgba(244, 255, 251, 0.88);
          font-size: 18px;
          line-height: 1.7;
        }

        .home-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 70px;
        }

        .home-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(130px, 1fr));
          gap: 26px;
        }

        .home-stat {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .home-stat svg {
          color: #69f8dd;
          flex: 0 0 auto;
        }

        .home-stat strong {
          display: block;
          color: #fff;
          font-size: 21px;
          line-height: 1.1;
        }

        .home-stat span {
          display: block;
          margin-top: 3px;
          color: rgba(244, 255, 251, 0.76);
          font-size: 13px;
        }

        .home-content {
          padding: 42px 0 28px;
        }

        .home-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 24px;
        }

        .home-section-title h2 {
          margin: 0;
          font-size: 27px;
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: 0;
        }

        .home-section-title a {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #007a68;
          font-size: 14px;
          font-weight: 900;
          white-space: nowrap;
        }

        .home-panel-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          margin-top: 18px;
          color: #007a68;
          font-size: 14px;
          font-weight: 900;
        }

        .race-grid {
          position: relative;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 34px;
        }

        .race-card,
        .panel,
        .horse-card {
          border: 1px solid #cdeee8;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 18px 50px rgba(14, 71, 66, 0.06);
        }

        .race-card {
          min-height: 315px;
          display: flex;
          flex-direction: column;
          padding: 16px;
        }

        .race-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 34px;
          color: #315a56;
          font-size: 13px;
          font-weight: 900;
        }

        .pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 0 12px;
          border-radius: 5px;
          color: #006755;
          background: #d9fbf4;
          font-size: 13px;
          font-weight: 950;
        }

        .pill-live {
          color: #fff;
          background: #18b99e;
        }

        .race-card h3,
        .horse-card h3 {
          margin: 18px 0 9px;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 950;
        }

        .muted {
          color: #6a817e;
          font-size: 14px;
        }

        .race-facts {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 14px;
          color: #41605d;
          font-size: 13px;
          font-weight: 800;
        }

        .race-facts span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .race-card img {
          width: 100%;
          height: 94px;
          margin: 18px 0 0;
          border-radius: 7px;
          object-fit: cover;
        }

        .card-action {
          width: 100%;
          min-height: 42px;
          margin-top: auto;
          border: 1px solid #bfece5;
          border-radius: 7px;
          color: #006755;
          background: #f3fffc;
          font-weight: 950;
          cursor: pointer;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .panel {
          padding: 24px;
        }

        .horse-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .horse-card {
          overflow: hidden;
        }

        .horse-photo {
          position: relative;
          height: 138px;
        }

        .horse-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rank-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #0d2321;
          background: #f9df94;
          font-size: 13px;
          font-weight: 950;
        }

        .horse-body {
          padding: 14px;
        }

        .horse-body h3 {
          margin-top: 0;
          font-size: 18px;
        }

        .horse-stat-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 12px;
          color: #6a817e;
          font-size: 12px;
        }

        .horse-stat-row strong {
          color: #0d2321;
        }

        .jockey-list,
        .result-list,
        .predictor-list {
          display: grid;
          gap: 0;
        }

        .jockey-row,
        .result-row {
          display: grid;
          align-items: center;
          gap: 14px;
          border-bottom: 1px solid #e5f3f0;
        }

        .jockey-row {
          grid-template-columns: 28px 42px 1fr auto auto;
          min-height: 76px;
          font-size: 13px;
        }

        .home-avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #06332e;
          background: #d9fbf4;
          font-size: 12px;
          font-weight: 950;
        }

        .home-avatar-1 { background: #f9df94; }
        .home-avatar-2 { background: #d6f2f5; }
        .home-avatar-3 { background: #ffd7b8; }

        .rank-number {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eef6f4;
          color: #315a56;
          font-weight: 950;
        }

        .jockey-row strong,
        .result-row strong {
          color: #0d2321;
          font-weight: 950;
        }

        .jockey-row span,
        .result-row span {
          color: #78918d;
        }

        .lower-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 20px;
          margin-bottom: 28px;
        }

        .tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-bottom: 18px;
          border: 1px solid #d9ece9;
          border-radius: 8px;
          overflow: hidden;
        }

        .tabs button {
          min-height: 43px;
          border: 0;
          border-right: 1px solid #d9ece9;
          color: #53706c;
          background: #fff;
          font-weight: 900;
          cursor: pointer;
        }

        .tabs button:first-child {
          color: #006755;
          background: #edfffb;
          box-shadow: inset 0 0 0 1px #bff1e8;
        }

        .tabs button:last-child {
          border-right: 0;
        }

        .home-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .home-table th {
          padding: 15px 10px;
          color: #6a817e;
          font-size: 12px;
          text-align: left;
        }

        .home-table td {
          padding: 15px 10px;
          border-top: 1px solid #e5f3f0;
          font-weight: 800;
        }

        .horse-name-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mini-thumb {
          width: 28px;
          height: 28px;
          border-radius: 4px;
          object-fit: cover;
        }

        .result-row {
          grid-template-columns: 140px 1fr auto auto;
          min-height: 112px;
        }

        .result-row img {
          width: 140px;
          height: 70px;
          border-radius: 8px;
          object-fit: cover;
        }

        .result-details {
          display: grid;
          gap: 5px;
        }

        .result-status {
          width: max-content;
          padding: 4px 8px;
          border-radius: 5px;
          color: #315a56;
          background: #eef6f4;
          font-size: 11px;
          font-weight: 950;
        }

        .result-status-live {
          color: #fff;
          background: #18b99e;
        }

        .winner {
          display: grid;
          gap: 3px;
          min-width: 150px;
        }

        .winner-icon {
          color: #f0a826;
          font-weight: 950;
        }

        .prediction-band {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr 260px;
          gap: 34px;
          align-items: center;
          min-height: 230px;
          margin-bottom: 30px;
          padding: 42px;
          border-radius: 8px;
          color: #f4fffb;
          overflow: hidden;
          background:
            radial-gradient(circle at 86% 55%, rgba(105, 248, 221, 0.28), transparent 28%),
            linear-gradient(120deg, #003b35, #008272);
        }

        .prediction-band h2 {
          margin: 0 0 12px;
          font-size: 27px;
          font-weight: 950;
        }

        .prediction-band p {
          max-width: 390px;
          margin: 0 0 22px;
          color: rgba(244, 255, 251, 0.82);
          line-height: 1.6;
        }

        .predictor-list {
          gap: 10px;
        }

        .predictor-row {
          display: grid;
          grid-template-columns: 28px 38px 1fr auto;
          align-items: center;
          gap: 12px;
          min-height: 44px;
          padding: 0 16px;
          border: 1px solid rgba(244, 255, 251, 0.24);
          border-radius: 999px;
          background: rgba(0, 35, 32, 0.2);
          font-weight: 900;
        }

        .predictor-row span:last-child {
          color: rgba(244, 255, 251, 0.86);
        }

        .trophy-art {
          justify-self: center;
          width: 210px;
          height: 210px;
          display: grid;
          place-items: center;
          color: #69f8dd;
          border-radius: 50%;
          background: rgba(244, 255, 251, 0.08);
          box-shadow: inset 0 0 60px rgba(105, 248, 221, 0.18);
        }

        .home-footer {
          color: #f4fffb;
          background: #002d28;
          padding: 34px 0 26px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr repeat(4, 1fr);
          gap: 50px;
        }

        .home-footer p,
        .home-footer a {
          color: rgba(244, 255, 251, 0.74);
          font-size: 14px;
          line-height: 1.7;
        }

        .home-footer h3 {
          margin: 0 0 14px;
          font-size: 15px;
        }

        .footer-links {
          display: grid;
          gap: 7px;
        }

        .newsletter {
          display: flex;
          align-items: center;
          height: 44px;
          border: 1px solid rgba(105, 248, 221, 0.38);
          border-radius: 6px;
          overflow: hidden;
        }

        .newsletter input {
          min-width: 0;
          flex: 1;
          height: 100%;
          border: 0;
          padding: 0 13px;
          color: #f4fffb;
          background: transparent;
          outline: 0;
        }

        .newsletter button {
          width: 44px;
          height: 44px;
          border: 0;
          color: #06332e;
          background: #69f8dd;
          cursor: pointer;
        }

        .loading-line {
          color: #53706c;
          font-weight: 800;
        }

        @media (max-width: 1120px) {
          .home-menu { display: none; }
          .race-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .dashboard-grid,
          .lower-grid,
          .prediction-band { grid-template-columns: 1fr; }
          .horse-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .trophy-art { display: none; }
          .footer-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 720px) {
          .home-container { width: min(100% - 28px, 1230px); }
          .home-nav { height: 74px; }
          .home-brand-logo { height: 62px; width: auto; }
          .account-trigger { min-width: 160px; max-width: 210px; }
          .home-actions .home-icon-btn { display: none; }
          .home-btn { min-height: 42px; padding: 0 14px; font-size: 13px; }
          .home-hero {
            min-height: 660px;
            background-position: center;
          }
          .home-hero h1 { font-size: clamp(42px, 13vw, 58px); }
          .home-stats,
          .race-grid,
          .horse-grid,
          .footer-grid { grid-template-columns: 1fr; }
          .panel { padding: 18px; }
          .jockey-row { grid-template-columns: 26px 38px 1fr; }
          .jockey-row span:nth-last-child(-n + 2) { display: none; }
          .result-row {
            grid-template-columns: 92px 1fr;
            padding: 14px 0;
          }
          .result-row img {
            width: 92px;
            height: 72px;
          }
          .winner,
          .result-row > strong:last-child { display: none; }
          .home-table th:nth-child(4),
          .home-table td:nth-child(4),
          .home-table th:nth-child(6),
          .home-table td:nth-child(6) { display: none; }
          .prediction-band { padding: 26px; }
        }
      `}</style>

      <header className="home-nav">
        <div className="home-container home-nav-inner">
          <a className="home-brand" href="#top" aria-label="GoldenHoof home">
            <img className="home-brand-logo" src="/navbar-logo.png" alt="" />
          </a>

          <nav className="home-menu" aria-label="Primary navigation">
            {["Races", "Horses", "Jockeys", "Results", "Rankings", "Predictions", "News", "About"].map((item) => (
              <a href={`#${item.toLowerCase()}`} key={item}>
                {item}
              </a>
            ))}
          </nav>

          <div className="home-actions">
            <button className="home-icon-btn" type="button" aria-label="Search">
              <Icon name="search" size={24} />
            </button>
            {authSession ? (
              <div className="account-menu">
                <button
                  className={`home-btn account-trigger ${
                    isAccountMenuOpen ? "account-trigger-open" : ""
                  }`}
                  type="button"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setIsAccountMenuOpen((current) => !current)}
                >
                  <Icon name="user" size={20} />
                  <span className="account-trigger-name">{accountName}</span>
                  <Icon name="chevron" size={18} />
                </button>

                {isAccountMenuOpen && (
                  <div className="account-dropdown" role="menu">
                    <Link
                      className="account-menu-item"
                      role="menuitem"
                      to={isAdmin ? "/admin/dashboard" : dashboardPath}
                    >
                      <Icon name="dashboard" size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <Link className="account-menu-item" role="menuitem" to="/profile">
                      <Icon name="user" size={18} />
                      <span>Profile</span>
                    </Link>
                    <button
                      className="account-menu-item account-menu-logout"
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <Icon name="logout" size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link className="home-btn" to="/login">
                  Log in
                </Link>
                <Link className="home-btn home-btn-primary" to="/register">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="home-hero" id="top">
        <div className="home-container">
          <div className="home-hero-content">
            <span className="home-kicker">LIVE THE THRILL</span>
            <h1>
              Where Champions
              <span>Run to Glory</span>
            </h1>
            <p>
              GoldenHoof is your ultimate destination for horse racing. Follow
              the races, track the champions, and be part of every thrilling
              moment.
            </p>
            <div className="home-hero-actions">
              <a className="home-btn home-btn-primary" href="#races">
                Explore Races
                <Icon name="arrow" size={20} />
              </a>
              <a className="home-btn" href="#results">
                View Live Results
                <Icon name="chart" size={20} />
              </a>
            </div>

            <div className="home-stats">
              <Stat icon="trophy" value="120+" label="Races This Season" />
              <Stat icon="horse" value="200+" label="Horses" />
              <Stat icon="users" value="150+" label="Jockeys" />
              <Stat icon="crown" value="50K+" label="Active Fans" />
            </div>
          </div>
        </div>
      </section>

      <section className="home-content">
        <div className="home-container">
          <section id="races">
            <SectionTitle
              title="Upcoming Races"
              action={{ label: "View Full Schedule", href: "#races" }}
            />
            {isLoading ? (
              <p className="loading-line">Loading races...</p>
            ) : (
              <div className="race-grid">
                {homeData.races.map((race) => (
                  <article className="race-card" key={race.id}>
                    <div className="race-meta">
                      <span className={`pill ${race.status ? "pill-live" : ""}`}>
                        {race.status || race.time}
                      </span>
                      <span>Race {race.id}</span>
                    </div>
                    <h3>{race.name}</h3>
                    <span className="muted">{race.venue}</span>
                    <div className="race-facts">
                      <span>
                        <Icon name="clock" size={15} />
                        {race.distance}
                      </span>
                      <span>
                        <Icon name="map" size={15} />
                        {race.surface}
                      </span>
                    </div>
                    {race.status && <img src={race.image} alt={`${race.name} race`} />}
                    <button className="card-action" type="button">
                      {race.status ? "Watch Live" : "View Details"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="dashboard-grid" id="horses">
            <section className="panel">
              <SectionTitle
                title="Top Horses"
                action={{ label: "View All Horses", href: "#horses" }}
              />
              <div className="horse-grid">
                {homeData.horses.map((horse) => (
                  <article className="horse-card" key={horse.id}>
                    <div className="horse-photo">
                      <img src={horse.image} alt={horse.name} />
                      <span className="rank-badge">{horse.rank}</span>
                    </div>
                    <div className="horse-body">
                      <h3>{horse.name}</h3>
                      <span className="muted">
                        {horse.age} · {horse.breed}
                      </span>
                      <div className="horse-stat-row">
                        <span>Owner</span>
                        <strong>{horse.owner}</strong>
                      </div>
                      <div className="horse-stat-row">
                        <span>Rating</span>
                        <strong>{horse.rating}</strong>
                      </div>
                      <div className="horse-stat-row">
                        <span>Wins</span>
                        <strong>{horse.wins}</strong>
                      </div>
                      <button className="card-action" type="button">
                        View Profile
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel" id="jockeys">
              <SectionTitle
                title="Top Jockeys"
                action={{ label: "View All Jockeys", href: "#jockeys" }}
              />
              <div className="jockey-list">
                {homeData.jockeys.map((jockey) => (
                  <div className="jockey-row" key={jockey.id}>
                    <span className="rank-number">{jockey.rank}</span>
                    <Avatar name={jockey.name} rank={jockey.rank} />
                    <strong>{jockey.name}</strong>
                    <span>{jockey.wins} Wins</span>
                    <span>Win Rate {jockey.winRate}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="lower-grid">
            <section className="panel" id="rankings">
              <SectionTitle title="Leaderboard" />
              <div className="tabs" role="tablist" aria-label="Leaderboard views">
                <button type="button">Horses</button>
                <button type="button">Jockeys</button>
                <button type="button">Owners</button>
              </div>
              <table className="home-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Horse</th>
                    <th>Rating</th>
                    <th>Wins</th>
                    <th>Places</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {homeData.standings.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>
                        <span className="horse-name-cell">
                          <img className="mini-thumb" src="/goldenhoof-hero.png" alt="" />
                          {row.horse}
                        </span>
                      </td>
                      <td>{row.rating}</td>
                      <td>{row.wins}</td>
                      <td>{row.places}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <a className="home-panel-link" href="#rankings">
                View Full Rankings
                <Icon name="arrow" size={16} />
              </a>
            </section>

            <section className="panel" id="results">
              <SectionTitle
                title="Latest Race Results"
                action={{ label: "View All Results", href: "#results" }}
              />
              <div className="result-list">
                {homeData.results.map((result) => (
                  <article className="result-row" key={result.id}>
                    <img src={result.image} alt={result.race} />
                    <div className="result-details">
                      <span
                        className={`result-status ${
                          result.status === "LIVE" ? "result-status-live" : ""
                        }`}
                      >
                        {result.status}
                      </span>
                      <strong>{result.race}</strong>
                      <span>
                        {result.venue} · {result.distance} · {result.surface}
                      </span>
                    </div>
                    <div className="winner">
                      <span className="winner-icon">1st</span>
                      <strong>{result.winner}</strong>
                      <span>{result.jockey}</span>
                    </div>
                    <strong>{result.time}</strong>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="prediction-band" id="predictions">
            <div>
              <h2>Make Your Predictions</h2>
              <p>
                Predict race winners and compete with fans around the world.
                Win points and unlock exclusive rewards.
              </p>
              <a className="home-btn home-btn-primary" href="#predictions">
                Start Predicting
                <Icon name="arrow" size={20} />
              </a>
            </div>
            <div>
              <h3>Top Predictors This Week</h3>
              <div className="predictor-list">
                {homeData.predictors.map((predictor) => (
                  <div className="predictor-row" key={predictor.id}>
                    <span>{predictor.id}</span>
                    <Avatar name={predictor.name} rank={predictor.id} />
                    <strong>{predictor.name}</strong>
                    <span>{predictor.points.toLocaleString()} PTS</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="trophy-art">
              <Icon name="trophy" size={132} />
            </div>
          </section>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div>
            <a className="home-footer-brand" href="#top">
              <Icon name="logo" size={32} />
              <span>GoldenHoof</span>
            </a>
            <p>
              The ultimate platform for horse racing enthusiasts. Stay updated,
              stay excited.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            <div className="footer-links">
              <a href="#races">Races</a>
              <a href="#horses">Horses</a>
              <a href="#jockeys">Jockeys</a>
              <a href="#results">Results</a>
              <a href="#rankings">Rankings</a>
            </div>
          </div>
          <div>
            <h3>Support</h3>
            <div className="footer-links">
              <a href="#support">Help Center</a>
              <a href="#support">Contact Us</a>
              <a href="#support">Terms of Use</a>
              <a href="#support">Privacy Policy</a>
              <a href="#support">FAQ</a>
            </div>
          </div>
          <div>
            <h3>Community</h3>
            <div className="footer-links">
              <a href="#news">News</a>
              <a href="#events">Events</a>
              <a href="#blog">Blog</a>
              <a href="#forum">Forum</a>
              <a href="#about">About Us</a>
            </div>
          </div>
          <div>
            <h3>Stay Updated</h3>
            <p>Subscribe to our newsletter</p>
            <div className="newsletter">
              <input type="email" placeholder="Enter your email" aria-label="Email address" />
              <button type="button" aria-label="Subscribe">
                <Icon name="mail" size={18} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;
