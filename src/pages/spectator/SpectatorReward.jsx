import { useEffect, useState } from "react";
import {
  Tabs,
  Card,
  Button,
  Tag,
  Typography,
  message,
  Spin,
  Empty,
} from "antd";
import {
  getRewardsDashboard,
  getMyAssets,
  claimReward,
} from "../../api/services/reward.service";
import { LockOutlined } from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;

export default function SpectatorRewards() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardItems, setDashboardItems] = useState([]);
  const [myAssets, setMyAssets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingId, setIsSubmittingId] = useState(null);

  async function loadInitialData() {
    setIsLoading(true);
    try {
      const [dashboardData, assetsData] = await Promise.all([
        getRewardsDashboard(),
        getMyAssets(),
      ]);
      setDashboardItems(Array.isArray(dashboardData) ? dashboardData : []);
      setMyAssets(assetsData);
    } catch (error) {
      message.error(error?.message || "Failed to load rewards data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClaim(rewardId) {
    setIsSubmittingId(rewardId);
    try {
      await claimReward(rewardId);
      message.success("Item claimed successfully");

      const [dashboardData, assetsData] = await Promise.all([
        getRewardsDashboard(),
        getMyAssets(),
      ]);
      setDashboardItems(Array.isArray(dashboardData) ? dashboardData : []);
      setMyAssets(assetsData);
    } catch (error) {
      message.error(error?.message || "Failed to claim reward");
    } finally {
      setIsSubmittingId(null);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  function getConditionTag(item) {
    if (item.conditionType === "SHOP") {
      return (
        <Tag
          color="cyan"
          style={{ fontSize: "13px", padding: "4px 10px", fontWeight: "700" }}
        >
          Shop Item
        </Tag>
      );
    }
    return (
      <Tag
        color="gold"
        style={{ fontSize: "13px", padding: "4px 10px", fontWeight: "700" }}
      >
        Milestone: {item.requiredValue} Points
      </Tag>
    );
  }

  function getRewardTypeLabel(type) {
    switch (type) {
      case "INSURANCE_CARD":
        return "Insurance Card";
      case "POINTS":
        return "Bonus Points";
      case "BACKGROUND":
        return "Profile Background";
      case "AVATAR_FRAME":
        return "Avatar Frame";
      default:
        return type;
    }
  }

  const insuranceCardImg =
    dashboardItems.find((item) => item.rewardType === "INSURANCE_CARD")
      ?.rewardValue ||
    "https://api.horse-racing.io.vn/static/golden-hoof/golden-hoof-1782113268373-765684462.png";
    
  return (
    <main className="spectator-rewards-page">
      <style>{`
        .spectator-rewards-page {
          min-height: 100vh;
          background: #002d28;
          color: #f4fffb;
          padding: 50px 24px;
          font-family: Inter, sans-serif;
        }
        .rewards-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .rewards-header {
          margin-bottom: 40px;
        }
        .rewards-header h1.ant-typography {
          color: #69f8dd;
          margin: 0 0 12px 0;
          font-weight: 950;
          font-size: clamp(32px, 5vw, 46px);
          letter-spacing: -0.5px;
        }
        .rewards-header p.ant-typography {
          color: #e2f1ec;
          font-size: 18px;
          line-height: 1.6;
          margin: 0;
          max-width: 800px;
        }
        
        /* Custom Ant Design Tabs Theme */
        .rewards-tabs .ant-tabs-nav {
          margin-bottom: 36px;
          border-bottom: 2px solid rgba(105, 248, 221, 0.15) !important;
        }
        .rewards-tabs .ant-tabs-tab {
          color: rgba(244, 255, 251, 0.5) !important;
          font-weight: 900;
          font-size: 18px;
          padding: 14px 8px;
          transition: color 0.2s;
        }
        .rewards-tabs .ant-tabs-tab:hover {
          color: #69f8dd !important;
        }
        .rewards-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #69f8dd !important;
          font-size: 18px;
        }
        .rewards-tabs .ant-tabs-ink-bar {
          background: #69f8dd !important;
          height: 4px !important;
          border-radius: 2px;
        }

        /* Grid Layout với chiều cao đồng đều cho các ô */
        .rewards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
          align-items: stretch;
        }

        /* Enhanced Reward Cards có cố định chiều cao tối thiểu và co dãn bằng nhau */
        .reward-card {
          background: rgba(0, 68, 60, 0.8) !important;
          border: 2px solid rgba(105, 248, 221, 0.25) !important;
          border-radius: 16px !important;
          backdrop-filter: blur(20px);
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          height: 100%;
        }
        .reward-card:hover {
          border-color: #69f8dd !important;
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(105, 248, 221, 0.12), 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        .reward-card-locked {
          opacity: 0.55;
          background: rgba(0, 45, 40, 0.5) !important;
          border-color: rgba(244, 255, 251, 0.1) !important;
        }
        .reward-card-claimed {
          border-color: rgba(105, 248, 221, 0.1) !important;
          background: rgba(0, 35, 32, 0.6) !important;
          opacity: 0.8;
        }
        .reward-card .ant-card-body {
          padding: 28px;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 480px; /* Tăng min-height để chứa vừa phần media mới */
        }
        .reward-meta-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }
        .reward-title-container {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .reward-lock-icon {
          color: rgba(244, 255, 251, 0.4);
          font-size: 18px;
          margin-top: 4px;
        }
        .reward-title {
          color: #ffffff !important;
          font-size: 22px !important;
          font-weight: 950 !important;
          margin: 0 !important;
          height: 50px;
          line-height: 1.3;
        }
        .reward-type-tag {
          background: rgba(105, 248, 221, 0.1);
          border: 1px solid rgba(105, 248, 221, 0.4);
          color: #69f8dd;
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 800;
          padding: 3px 8px;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        /* Khu vực hiển thị media (ảnh hoặc text điểm số) */
        .reward-media-display {
          width: 100%;
          height: 140px;
          margin: 16px 0;
          background: rgba(0, 32, 28, 0.6);
          border: 1px solid rgba(105, 248, 221, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .reward-media-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
        }
        .reward-media-points {
          color: #69f8dd;
          font-size: 38px;
          font-weight: 950;
          text-shadow: 0 0 10px rgba(105, 248, 221, 0.3);
        }

        .reward-desc {
          color: #e2f1ec !important;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: auto !important; /* Đẩy cụm action xuống đáy card */
          padding-top: 8px;
          font-weight: 500;
          flex: 1;
        }
        .reward-action-area {
          margin-top: 24px;
        }
        
        /* High Contrast Buttons */
        .reward-btn {
          width: 100%;
          min-height: 46px;
          font-weight: 950;
          border-radius: 8px;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 1px;
          transition: all 0.2s ease;
        }
        .reward-btn-claim {
          background: #69f8dd !important;
          border: transparent !important;
          color: #062724 !important;
          box-shadow: 0 4px 12px rgba(105, 248, 221, 0.2);
        }
        .reward-btn-claim:hover {
          background: #86ffea !important;
          color: #062724 !important;
          transform: scale(1.01);
          box-shadow: 0 6px 16px rgba(105, 248, 221, 0.3);
        }
        .reward-btn-claimed {
          background: rgba(255, 255, 255, 0.08) !important;
          border: 2px solid rgba(255, 255, 255, 0.15) !important;
          color: rgba(244, 255, 251, 0.5) !important;
        }
        .reward-btn-locked {
          background: rgba(0, 0, 0, 0.3) !important;
          border: 2px solid rgba(244, 255, 251, 0.08) !important;
          color: rgba(244, 255, 251, 0.4) !important;
        }

        /* My Assets / Vault Styles */
        .vault-section-title {
          color: #69f8dd !important;
          font-size: 24px !important;
          font-weight: 950;
          margin: 0 0 20px 0 !important;
          border-left: 4px solid #69f8dd;
          padding-left: 14px;
          letter-spacing: -0.3px;
        }
        .vault-card {
          background: rgba(0, 68, 60, 0.4) !important;
          border: 2px solid rgba(105, 248, 221, 0.15) !important;
          border-radius: 12px;
          margin-bottom: 40px;
          padding: 28px;
        }
          .vault-insurance-block {
          display: flex;
          align-items: center;
          gap: 28px;
          background: rgba(0, 32, 28, 0.6);
          border: 2px solid rgba(105, 248, 221, 0.2);
          border-radius: 12px;
          padding: 20px 24px;
          max-width: 420px;
        }
        .vault-insurance-img-wrapper {
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(105, 248, 221, 0.1);
        }
        .vault-insurance-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 6px;
        }
        .vault-asset-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 20px;
        }
        .vault-asset-item {
          background: rgba(0, 32, 28, 0.6);
          border: 2px solid rgba(105, 248, 221, 0.1);
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          transition: border-color 0.2s;
        }
        .vault-asset-item:hover {
          border-color: rgba(105, 248, 221, 0.4);
        }
        .vault-asset-img {
          width: 100%;
          height: 90px;
          object-fit: contain;
          margin-bottom: 12px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
        }
        .vault-stat-box {
          display: inline-block;
          background: rgba(105, 248, 221, 0.12);
          border: 2px solid rgba(105, 248, 221, 0.3);
          border-radius: 10px;
          padding: 20px 36px;
          text-align: center;
        }
        .vault-card .ant-typography-secondary {
          color: #a3c2ba !important;
          font-size: 16px;
        }

        /* Loading / Empty Overrides */
        .rewards-loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }
        .ant-empty-description {
          color: #a3c2ba !important;
          font-size: 16px;
        }
      `}</style>

      <div className="rewards-container">
        <header className="rewards-header">
          <Title level={1}>Spectator Rewards</Title>
          <Paragraph
            className="reward-para"
            style={{ color: "#cdf5ee", fontSize: "20px" }}
          >
            Claim unique profile assets, frames, and betting insurance using
            your accumulated points and milestones.
          </Paragraph>
        </header>

        <Tabs
          className="rewards-tabs"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={[
            { key: "dashboard", label: "Reward Shop & Milestones" },
            { key: "assets", label: "My Vault" },
          ]}
        />

        {isLoading ? (
          <div className="rewards-loading-container">
            <Spin size="large" />
          </div>
        ) : activeTab === "dashboard" ? (
          dashboardItems.length === 0 ? (
            <Empty description="No reward items found" />
          ) : (
            <div className="rewards-grid">
              {dashboardItems.map((item) => {
                const isClaimed = item.isClaimed === true;
                const isAvailable = item.isAvailable === true;
                const isLocked = !isClaimed && !isAvailable;

                let cardClass = "reward-card";
                if (isClaimed) cardClass += " reward-card-claimed";
                if (isLocked) cardClass += " reward-card-locked";

                const isPointsType = item.rewardType === "POINTS";

                return (
                  <Card key={item.id} className={cardClass} buffered={false}>
                    <div className="reward-meta-top">
                      <div className="reward-title-container">
                        {isLocked && (
                          <LockOutlined className="reward-lock-icon" />
                        )}
                        <Title level={4} className="reward-title">
                          {item.title}
                        </Title>
                      </div>
                      {/* <Tag className="reward-type-tag">
                            {getRewardTypeLabel(item.rewardType)}
                        </Tag> */}
                    </div>

                    <div style={{ marginBottom: "8px" }}>
                      {getConditionTag(item)}
                    </div>

                    {/* Media Display Area */}
                    <div className="reward-media-display">
                      {isPointsType ? (
                        <span className="reward-media-points">
                          +{item.rewardValue}
                        </span>
                      ) : (
                        <img
                          src={item.rewardValue}
                          alt={item.title}
                          className="reward-media-img"
                          onError={(e) => {
                            // Dự phòng khi link ảnh die
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </div>

                    <Paragraph className="reward-desc" ellipsis={{ rows: 3 }}>
                      {item.description}
                    </Paragraph>

                    <div className="reward-action-area">
                      {isClaimed ? (
                        <Button
                          className="reward-btn reward-btn-claimed"
                          disabled
                        >
                          Claimed
                        </Button>
                      ) : isLocked ? (
                        <Button
                          className="reward-btn reward-btn-locked"
                          icon={<LockOutlined />}
                          disabled
                        >
                          Locked
                        </Button>
                      ) : (
                        <Button
                          className="reward-btn reward-btn-claim"
                          loading={isSubmittingId === item.id}
                          onClick={() => handleClaim(item.id)}
                        >
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : (
          <div className="vault-content">
            <Title level={3} className="vault-section-title">
              Insurance Status
            </Title>
            <div className="vault-card">
              {myAssets?.hasInsuranceCard ? (
                <div className="vault-insurance-block">
                  <div className="vault-insurance-img-wrapper">
                    <img
                      src={insuranceCardImg}
                      alt="Insurance Card"
                      className="vault-insurance-img"
                    />
                  </div>
                  <div className="vault-insurance-info">
                    <Text
                      style={{
                        color: "#e2f1ec",
                        fontSize: "15px",
                        fontWeight: "700",
                        marginBottom: 4,
                      }}
                    >
                      Active Insurance Cards
                    </Text>
                    <Title
                      level={2}
                      style={{
                        color: "#69f8dd",
                        margin: 0,
                        fontWeight: 950,
                        fontSize: "36px",
                        lineHeight: 1,
                      }}
                    >
                      x{myAssets?.insuranceCardsCount || 1}
                    </Title>
                  </div>
                </div>
              ) : (
                <Text type="secondary">
                  You do not have any active losing-bet insurance cards.
                </Text>
              )}
            </div>

            <Title level={3} className="vault-section-title">
              Profile Backgrounds
            </Title>
            <div className="vault-card">
              {!myAssets?.backgrounds || myAssets.backgrounds.length === 0 ? (
                <Text type="secondary">
                  No custom profile backgrounds claimed yet.
                </Text>
              ) : (
                <div className="vault-asset-grid">
                  {myAssets.backgrounds.map((bgUrl, idx) => (
                    <div key={idx} className="vault-asset-item">
                      <img
                        src={bgUrl}
                        alt="Background"
                        className="vault-asset-img"
                      />
                      <Text
                        strong
                        style={{
                          color: "#ffffff",
                          fontSize: "14px",
                          display: "block",
                        }}
                      >
                        Background #{idx + 1}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
