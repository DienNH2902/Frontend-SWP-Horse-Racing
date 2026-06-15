import React from "react";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

const features = [
  ["trophy", "Live Races", "Real-time updates and results"],
  ["horse", "Race Management", "Manage horses, jockeys and races"],
  ["chart", "Rankings", "Track rankings and statistics"],
  ["gift", "Predictions", "Predict outcomes and win rewards"],
];

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
    style: { display: "block", overflow: "visible" },
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
    trophy: (
      <>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v6a5 5 0 0 1-10 0V4Z" />
        <path d="M5 6H3v3a4 4 0 0 0 4 4" />
        <path d="M19 6h2v3a4 4 0 0 1-4 4" />
      </>
    ),
    horse: (
      <>
        <path d="M4 18v-5l4-4 5 1 3-3 4 4-3 2v5" />
        <path d="M8 14v4" />
        <path d="M13 14v4" />
        <path d="M16 8V4" />
        <path d="M18 10h.01" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20V8" />
        <path d="M2 20h22" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13" />
        <path d="M3 12h18" />
        <path d="M7.5 8a2.5 2.5 0 1 1 4.5-1.5V8" />
        <path d="M16.5 8A2.5 2.5 0 1 0 12 6.5V8" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export default function ForgotPassword() {
  return (
    <main className="gh-page">
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          overflow: hidden;
        }
        body {
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overscroll-behavior: none;
        }
        button, input { font: inherit; }
        input::placeholder { color: rgba(244, 255, 251, 0.6); }

        .gh-page {
          width: 100%;
          height: 100dvh;
          overflow: hidden;
          padding: clamp(10px, 1.5vw, 22px);
          color: #f4fffb;
          background:
            radial-gradient(circle at 18% 22%, rgba(95, 244, 213, 0.14), transparent 30%),
            linear-gradient(135deg, #06332e 0%, #022622 48%, #001b1a 100%);
        }

        .gh-shell {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: minmax(420px, 0.52fr) minmax(560px, 1fr);
          overflow: hidden;
          border: 1px solid rgba(94, 248, 216, 0.32);
          border-radius: 14px;
          background: rgba(1, 38, 34, 0.42);
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
        }

        .gh-form-panel {
          min-height: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: clamp(10px, 1.8vh, 24px);
          padding: clamp(18px, 2.7vw, 52px) clamp(28px, 4vw, 68px);
          border-right: 1px solid rgba(94, 248, 216, 0.28);
          background: linear-gradient(145deg, rgba(5, 60, 52, 0.92), rgba(0, 36, 33, 0.96));
        }

        .gh-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 38px;
          flex: 0 0 auto;
          color: #fff;
          font-size: clamp(20px, 1.35vw, 27px);
          font-weight: 850;
          line-height: 1;
          white-space: nowrap;
          overflow: visible;
        }

        .gh-brand-icon {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: grid;
          place-items: center;
          color: #5ef8d8;
          overflow: visible;
        }

        .gh-form-wrap {
          width: 100%;
          max-width: 520px;
        }

        .gh-title {
          margin: 0 0 clamp(8px, 1.2vh, 16px);
          font-size: clamp(34px, 3.25vw, 56px);
          line-height: 1.12;
          font-weight: 950;
          letter-spacing: 0;
        }

        .gh-title span,
        .gh-hero-title span {
          display: block;
          color: #5ef8d8;
        }

        .gh-subtitle {
          max-width: 450px;
          margin: 0 0 clamp(14px, 2.2vh, 30px);
          color: rgba(244, 255, 251, 0.78);
          font-size: clamp(15px, 1.05vw, 18px);
          line-height: 1.55;
        }

        .gh-ant-form .ant-form-item {
          margin-bottom: clamp(10px, 1.55vh, 18px);
        }

        .gh-ant-form .ant-form-item-label {
          padding-bottom: 8px;
        }

        .gh-ant-form .ant-form-item-label > label {
          height: auto;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
        }

        .gh-ant-form .ant-form-item-label > label::after {
          display: none;
        }

        .gh-ant-input {
          height: clamp(44px, 6vh, 56px);
          border: 1px solid rgba(222, 255, 249, 0.24);
          border-radius: 9px;
          color: #f4fffb;
          background: rgba(255, 255, 251, 0.05);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .gh-ant-input:hover,
        .gh-ant-input:focus,
        .gh-ant-input:focus-within,
        .gh-ant-input.ant-input-affix-wrapper-focused {
          border-color: rgba(94, 248, 216, 0.58) !important;
          background: rgba(94, 248, 216, 0.1) !important;
          box-shadow: 0 0 0 3px rgba(94, 248, 216, 0.08) !important;
        }

        .gh-ant-form .ant-form-item-has-error .gh-ant-input,
        .gh-ant-form .ant-form-item-has-error .gh-ant-input:hover,
        .gh-ant-form .ant-form-item-has-error .gh-ant-input:focus,
        .gh-ant-form .ant-form-item-has-error .gh-ant-input:focus-within {
          border-color: rgba(255, 112, 112, 0.72) !important;
          background: rgba(255, 112, 112, 0.08) !important;
          box-shadow: 0 0 0 3px rgba(255, 112, 112, 0.07) !important;
        }

        .gh-ant-form .ant-form-item-explain-error {
          color: #ffd6d6;
          font-size: 13px;
        }

        .gh-ant-input input,
        .gh-ant-input .ant-input {
          color: #f4fffb !important;
          background: transparent !important;
        }

        .gh-ant-input input::placeholder,
        .gh-ant-input .ant-input::placeholder {
          color: rgba(244, 255, 251, 0.6) !important;
        }

        .gh-ant-input .ant-input-prefix,
        .gh-ant-input .ant-input-password-icon {
          color: rgba(244, 255, 251, 0.7);
        }

        .gh-link {
          color: #5ef8d8;
          font-weight: 800;
          text-decoration: none;
        }

        .gh-login-btn {
          width: 100%;
          height: clamp(46px, 6.1vh, 58px);
          border-radius: 9px;
          cursor: pointer;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          padding: 0 28px;
          border: 0;
          color: #062724;
          background: linear-gradient(90deg, #69f8dd, #5ff4d5);
          box-shadow: 0 16px 42px rgba(95, 244, 213, 0.18);
          font-size: 17px;
          font-weight: 900;
        }

        .gh-login-btn > span {
          width: 100%;
          text-align: left;
        }

        .gh-login-btn:disabled {
          cursor: not-allowed;
          opacity: 0.72;
        }

        .gh-signup {
          margin: clamp(10px, 1.8vh, 20px) 0 0;
          text-align: center;
          color: rgba(244, 255, 251, 0.78);
          font-size: 15px;
        }

        .gh-hero {
          min-height: 0;
          height: 100%;
          display: flex;
          align-items: center;
          padding: clamp(38px, 5vw, 78px);
          background-image:
            linear-gradient(90deg, rgba(0, 32, 31, 0.88) 0%, rgba(0, 38, 36, 0.58) 30%, rgba(0, 0, 0, 0.08) 66%),
            linear-gradient(0deg, rgba(0, 18, 17, 0.42), rgba(0, 18, 17, 0.12)),
            url("/goldenhoof-hero.png");
          background-size: cover;
          background-position: center;
        }

        .gh-hero-content {
          width: min(430px, 100%);
          margin-top: clamp(18px, 11vh, 112px);
        }

        .gh-hero-title {
          margin: 0 0 clamp(10px, 1.8vh, 18px);
          font-size: clamp(30px, 2.7vw, 42px);
          line-height: 1.15;
          font-weight: 950;
          letter-spacing: 0;
        }

        .gh-hero-text {
          margin: 0 0 clamp(22px, 4.6vh, 42px);
          color: rgba(244, 255, 251, 0.84);
          font-size: clamp(15px, 1.1vw, 18px);
          line-height: 1.55;
        }

        .gh-features {
          display: grid;
          gap: clamp(14px, 2.7vh, 28px);
        }

        .gh-feature {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 17px;
          align-items: center;
          }

        .gh-feature-icon {
          color: #5ef8d8;
        }

        .gh-feature h3 {
          margin: 0 0 4px;
          font-size: 17px;
          font-weight: 900;
        }

        .gh-feature p {
          margin: 0;
          color: rgba(244, 255, 251, 0.72);
          font-size: 15px;
        }

        @media (max-height: 780px) and (min-width: 1081px) {
          .gh-form-panel {
            padding-top: 16px;
            padding-bottom: 16px;
            gap: 10px;
          }
          .gh-brand {
            min-height: 32px;
            font-size: 21px;
          }
          .gh-brand-icon {
            width: 32px;
            height: 32px;
            flex-basis: 32px;
          }
          .gh-title {
            font-size: clamp(30px, 2.6vw, 42px);
          }
          .gh-subtitle {
            margin-bottom: 12px;
            line-height: 1.42;
          }
          .gh-login-btn {
            height: 46px;
          }
          .gh-signup {
            margin-top: 8px;
          }
          .gh-hero-content {
            margin-top: 40px;
          }
          .gh-features {
            gap: 14px;
          }
        }

        @media (max-height: 690px) and (min-width: 1081px) {
          .gh-subtitle {
            display: none;
          }
          .gh-title {
            font-size: 34px;
          }
        }

        @media (max-width: 1080px) {
          .gh-shell {
            max-width: 560px;
            margin: 0 auto;
            grid-template-columns: 1fr;
          }
          .gh-form-panel {
            border-right: 0;
          }
          .gh-hero {
            display: none;
          }
        }

        @media (max-width: 620px) {
          .gh-page {
            padding: 0;
          }
          .gh-shell {
            max-width: none;
            border-right: 0;
            border-left: 0;
            border-radius: 0;
          }
          .gh-form-panel {
            padding: clamp(16px, 5vw, 28px) 22px;
          }
          .gh-title {
            font-size: clamp(32px, 10vw, 42px);
          }
        }

        @media (max-width: 420px), (max-height: 640px) {
          .gh-brand {
            min-height: 30px;
            font-size: 20px;
          }
          .gh-brand-icon {
            width: 30px;
            height: 30px;
            flex-basis: 30px;
          }
          .gh-title {
            margin-bottom: 8px;
            font-size: 31px;
          }
          .gh-subtitle {
            display: none;
          }
          .gh-ant-form .ant-form-item {
            margin-bottom: 10px;
          }
          .gh-ant-input,
          .gh-login-btn {
            height: 44px;
          }
          .gh-signup {
            margin-top: 8px;
          }
        }
      `}</style>

      <section className="gh-shell">
        <aside className="gh-form-panel">
          <div className="gh-brand">
            <span className="gh-brand-icon">
              <img className="brand-logo-img" src="/goldenhoof-logo.png" alt="" />
            </span>
            <span>GoldenHoof</span>
          </div>

          <div className="gh-form-wrap">
            <h1 className="gh-title">
              Credential
              <span>Recovery</span>
            </h1>
            <p className="gh-subtitle">
              Verify your security identity data to securely reset your system
              access passphrase.
            </p>

            <ForgotPasswordForm />
          </div>
        </aside>

        <section className="gh-hero">
          <div className="gh-hero-content">
            <h2 className="gh-hero-title">
              Where Champions
              <span>Run to Glory</span>
            </h2>
            <p className="gh-hero-text">
              Join a global community of racing enthusiasts, track live races,
              and celebrate every victory.
            </p>

            <div className="gh-features">
              {features.map(([icon, title, text]) => (
                <div className="gh-feature" key={title}>
                  <span className="gh-feature-icon">
                    <Icon name={icon} size={33} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
