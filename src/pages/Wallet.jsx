import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  message,
  Spin,
  Space,
  InputNumber,
  Form,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  WalletOutlined,
  DollarOutlined,
  LockOutlined,
  HistoryOutlined, // Import icon lịch sử
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProfile } from "../api/services/auth.service";
import { createDepositPayment } from "../api/services/wallet.service";

const { Text, Title, Paragraph } = Typography;

export default function Wallet() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState(null);

  async function loadProfileData() {
    setIsLoading(true);
    try {
      const data = await getProfile();
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      message.error(error?.message || "Unable to load wallet profile");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfileData();
  }, []);

  async function handleDeposit(values) {
    setIsSubmitting(true);
    try {
      const res = await createDepositPayment(values.amount);
      if (res?.success && res?.paymentUrl) {
        message.loading("Redirecting to VNPay Gateway...", 1.5);
        window.location.href = res.paymentUrl;
      } else {
        message.error("Failed to fetch payment link");
      }
    } catch (error) {
      message.error(error?.message || "Deposit transaction error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="wallet-page">
      <style>{`
        .wallet-page {
          min-height: 100vh;
          background: #002d28;
          color: #f4fffb;
          padding: 50px 24px;
          font-family: Inter, sans-serif;
        }
        .wallet-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .wallet-header-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 24px;
          margin-bottom: 40px;
        }
        .wallet-header {
          flex: 1;
          min-width: 300px;
        }
        .wallet-header h1.ant-typography {
          color: #69f8dd;
          margin: 0 0 12px 0;
          font-weight: 950;
          font-size: clamp(32px, 5vw, 46px);
          letter-spacing: -0.5px;
        }
        .wallet-header p.ant-typography {
          color: #e2f1ec;
          font-size: 18px;
          line-height: 1.6;
          margin: 0;
          max-width: 800px;
        }
        
        .balance-section-wrapper {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-end;
        }
        @media (max-width: 768px) {
          .balance-section-wrapper {
            align-items: flex-start;
            width: 100%;
          }
        }
        .balance-widgets-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .balance-widget {
          background: rgba(105, 248, 221, 0.08);
          border: 2px solid rgba(105, 248, 221, 0.25);
          border-radius: 12px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          min-width: 240px;
        }
        .balance-widget-held {
          background: rgba(255, 185, 54, 0.05);
          border: 2px solid rgba(255, 185, 54, 0.2);
        }
        .balance-icon {
          color: #69f8dd;
          font-size: 24px;
        }
        .balance-icon-held {
          color: #ffb936;
        }
        .balance-title {
          color: #a3c2ba !important;
          font-size: 13px !important;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 !important;
          font-weight: 700;
        }
        .balance-amount {
          color: #ffffff !important;
          font-size: 24px !important;
          font-weight: 950 !important;
          margin: 0 !important;
        }

        .btn-history-link {
          background: rgba(105, 248, 221, 0.1) !important;
          border: 1px solid rgba(105, 248, 221, 0.4) !important;
          color: #69f8dd !important;
          font-weight: 700 !important;
          border-radius: 8px !important;
          height: 38px !important;
        }
        .btn-history-link:hover {
          background: rgba(105, 248, 221, 0.2) !important;
          border-color: #69f8dd !important;
        }

        .wallet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 32px;
          margin-top: 24px;
        }
        @media (max-width: 500px) {
          .wallet-grid {
            grid-template-columns: 1fr;
          }
        }

        .action-card {
          background: rgba(0, 68, 60, 0.8) !important;
          border: 2px solid rgba(105, 248, 221, 0.25) !important;
          border-radius: 16px !important;
          backdrop-filter: blur(20px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          padding: 12px;
        }
        .action-card .ant-card-head {
          border-bottom: 1px solid rgba(105, 248, 221, 0.15) !important;
        }
        .action-card .ant-card-head-title {
          color: #69f8dd !important;
          font-weight: 900 !important;
          font-size: 20px !important;
          text-transform: uppercase;
        }

        .wallet-input-number {
          width: 100% !important;
          background: rgba(0, 32, 28, 0.6) !important;
          border: 2px solid rgba(105, 248, 221, 0.25) !important;
          color: #ffffff !important;
          border-radius: 8px !important;
          height: 50px !important;
          display: flex !important;
          align-items: center !important;
        }
        .wallet-input-number input {
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          height: 46px !important;
        }
        .wallet-input-number:hover, .wallet-input-number-focused {
          border-color: #69f8dd !important;
        }
        .input-label {
          color: #cdf5ee;
          font-size: 14px;
          margin-bottom: 8px;
          display: block;
          font-weight: 600;
        }

        .action-btn {
          width: 100%;
          min-height: 48px;
          font-weight: 950;
          border-radius: 8px;
          text-transform: uppercase;
          font-size: 15px;
          letter-spacing: 1px;
          transition: all 0.2s ease;
          margin-top: 16px;
        }
        .btn-deposit {
          background: #69f8dd !important;
          border: transparent !important;
          color: #062724 !important;
          box-shadow: 0 4px 12px rgba(105, 248, 221, 0.2);
        }
        .btn-deposit:hover {
          background: #86ffea !important;
          transform: scale(1.01);
        }
        .btn-withdraw-disabled {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 2px solid rgba(255, 255, 255, 0.1) !important;
          color: rgba(244, 255, 251, 0.3) !important;
        }

        .wallet-loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }
        .callback-alert {
          margin-bottom: 24px;
          border-radius: 8px;
          font-weight: 600;
        }
      `}</style>

      <div className="wallet-container">
        {callbackStatus && (
          <Alert
            className="callback-alert"
            message={callbackStatus.success ? "Success" : "Payment Failed"}
            description={callbackStatus.msg}
            type={callbackStatus.success ? "success" : "error"}
            showIcon
            closable
            onClose={() => setCallbackStatus(null)}
          />
        )}

        <div className="wallet-header-wrapper">
          <header className="wallet-header">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/home")}
              style={{
                color: "#69f8dd",
                padding: 0,
                marginBottom: "16px",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "700",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#86ffea")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#69f8dd")}
            >
              Back to Home
            </Button>
            <Title level={1}>My Wallet</Title>
            <Paragraph style={{ color: "#cdf5ee", fontSize: "20px" }}>
              Manage your balance secure gateway transactions, deposit funds
              seamlessly or request profile withdrawals.
            </Paragraph>
          </header>

          {/* Gom cụm số dư và nút chuyển hướng lịch sử vào một Wrapper */}
          <div className="balance-section-wrapper">
            <div className="balance-widgets-group">
              {/* Real Balance */}
              <div className="balance-widget">
                <WalletOutlined className="balance-icon" />
                <div>
                  <Title level={5} className="balance-title">
                    Available Balance
                  </Title>
                  <Title level={3} className="balance-amount">
                    {profile?.balance ? profile.balance.toLocaleString() : 0}{" "}
                    VNĐ
                  </Title>
                </div>
              </div>

              {/* Held Balance */}
              <div className="balance-widget balance-widget-held">
                <DollarOutlined className="balance-icon balance-icon-held" />
                <div>
                  <Title level={5} className="balance-title">
                    Held Balance
                  </Title>
                  <Title
                    level={3}
                    className="balance-amount"
                    style={{ color: "#ffb936" }}
                  >
                    {profile?.heldBalance
                      ? profile.heldBalance.toLocaleString()
                      : 0}{" "}
                    VNĐ
                  </Title>
                </div>
              </div>
            </div>

            {/* NÚT ĐI TỚI TRANG LỊCH SỬ GIAO DỊCH */}
            <Button
              type="default"
              icon={<HistoryOutlined />}
              className="btn-history-link"
              onClick={() => navigate("/money-transaction")}
            >
              Transaction History
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="wallet-loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <div className="wallet-grid">
            {/* BLOCK DEPOSIT */}
            <Card title="Deposit Funds" className="action-card">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleDeposit}
                initialValues={{ amount: 50000 }}
              >
                <span className="input-label">Deposit Amount (VND)</span>
                <Form.Item
                  name="amount"
                  rules={[
                    { required: true, message: "Please input amount" },
                    {
                      type: "number",
                      min: 10000,
                      message: "Minimum deposit is 10,000 VND",
                    },
                  ]}
                >
                  <InputNumber
                    className="wallet-input-number"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    addonAfter="VND"
                  />
                </Form.Item>

                <div style={{ marginBottom: "16px" }}>
                  <Text style={{ color: "#a3c2ba", fontSize: "13px" }}>
                    * Payment gateway processes through{" "}
                    <strong>VNPay Gateway Secure</strong>. Default sandbox bank
                    entity: <strong>NCB Bank</strong>.
                  </Text>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  className="action-btn btn-deposit"
                  loading={isSubmitting}
                >
                  Proceed to Payment
                </Button>
              </Form>
            </Card>

            {/* BLOCK WITHDRAW */}
            <Card
              title="Withdraw Money"
              className="action-card"
              style={{ opacity: 0.65 }}
            >
              <span className="input-label">Withdrawal Amount (VND)</span>
              <InputNumber
                className="wallet-input-number"
                disabled
                placeholder="0"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />

              <div
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                  padding: "16px 0",
                }}
              >
                <Space direction="vertical" size="small">
                  <LockOutlined
                    style={{ fontSize: "28px", color: "#ffb936" }}
                  />
                  <Text
                    style={{
                      color: "#ffb936",
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Feature Coming Soon
                  </Text>
                  <Text style={{ color: "#a3c2ba", fontSize: "13px" }}>
                    Withdraw system implementation is currently pending
                    administrative payment profiles setup.
                  </Text>
                </Space>
              </div>

              <Button
                className="action-btn btn-withdraw-disabled"
                disabled
                icon={<LockOutlined />}
              >
                Withdraw Request
              </Button>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
