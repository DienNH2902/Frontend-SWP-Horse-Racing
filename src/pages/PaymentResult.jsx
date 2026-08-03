import { useEffect, useState } from "react";
import { Button, Typography, Result, Card } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  WalletOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";

const { Text, Title } = Typography;

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    amount: "0",
    txnRef: "",
    bankCode: "",
    payDate: "",
  });

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    const amountRaw = searchParams.get("vnp_Amount");
    const txnRef = searchParams.get("vnp_TxnRef");
    const bankCode = searchParams.get("vnp_BankCode");
    const payDateRaw = searchParams.get("vnp_PayDate");

    // vnp_Amount từ VNPay nhân 100 nên cần chia lại 100 để ra số tiền gốc
    const realAmount = amountRaw
      ? (parseInt(amountRaw, 10) / 100).toLocaleString()
      : "0";

    // Định dạng lại chuỗi ngày tháng của VNPay (YYYYMMDDHHMMSS) thành trực quan hơn
    let formattedDate = payDateRaw || "";
    if (formattedDate.length === 14) {
      formattedDate = `${formattedDate.slice(6, 8)}/${formattedDate.slice(4, 6)}/${formattedDate.slice(0, 4)} ${formattedDate.slice(8, 10)}:${formattedDate.slice(10, 12)}:${formattedDate.slice(12, 14)}`;
    }

    if (responseCode === "00") {
      setIsSuccess(true);
    } else {
      setIsSuccess(false);
    }

    setPaymentInfo({
      amount: realAmount,
      txnRef: txnRef || "N/A",
      bankCode: bankCode || "N/A",
      payDate: formattedDate,
    });
  }, [searchParams]);

  return (
    <main className="payment-result-page">
      <style>{`
        .payment-result-page {
          min-height: 100vh;
          background: #002d28;
          color: #f4fffb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: Inter, sans-serif;
        }
        .result-card {
          background: rgba(0, 68, 60, 0.8) !important;
          border: 2px solid rgba(105, 248, 221, 0.25) !important;
          border-radius: 16px !important;
          backdrop-filter: blur(20px);
          max-width: 550px;
          width: 100%;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
          text-align: center;
        }
        .result-icon-wrapper {
          font-size: 64px;
          margin-bottom: 16px;
        }
        .icon-success {
          color: #69f8dd;
        }
        .icon-failed {
          color: #ff4d4f;
        }
        .detail-box {
          background: rgba(0, 32, 28, 0.6);
          border: 1px solid rgba(105, 248, 221, 0.15);
          border-radius: 8px;
          padding: 20px;
          margin: 24px 0;
          text-align: left;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .detail-row:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          color: #a3c2ba;
        }
        .detail-value {
          color: #ffffff;
          font-weight: 700;
        }
        .amount-highlight {
          color: #69f8dd !important;
          font-size: 20px !important;
        }
        .action-group {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        .result-btn {
          min-height: 44px;
          font-weight: 800;
          border-radius: 8px;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 0.5px;
          flex: 1;
        }
        .btn-wallet {
          background: #69f8dd !important;
          border: transparent !important;
          color: #062724 !important;
        }
        .btn-wallet:hover {
          background: #86ffea !important;
        }
        .btn-home {
          background: transparent !important;
          border: 2px solid rgba(105, 248, 221, 0.4) !important;
          color: #69f8dd !important;
        }
        .btn-home:hover {
          border-color: #69f8dd !important;
          background: rgba(105, 248, 221, 0.05) !important;
        }
      `}</style>

      <Card className="result-card">
        <div className="result-icon-wrapper">
          {isSuccess ? (
            <CheckCircleFilled className="icon-success" />
          ) : (
            <CloseCircleFilled className="icon-failed" />
          )}
        </div>

        <Title
          level={2}
          style={{ color: "#ffffff", margin: "0 0 8px 0", fontWeight: 900 }}
        >
          {isSuccess ? "Deposit Successful!" : "Deposit Failed"}
        </Title>
        <Text style={{ color: "#cdf5ee", fontSize: "15px" }}>
          {isSuccess
            ? "Your account balance has been updated successfully."
            : "The transaction was canceled or encountered an issue during processing."}
        </Text>

        <div className="detail-box">
          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span
              className={`detail-value ${isSuccess ? "amount-highlight" : ""}`}
            >
              {paymentInfo.amount} VND
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Order Ref:</span>
            <span className="detail-value">{paymentInfo.txnRef}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Bank Entity:</span>
            <span className="detail-value">{paymentInfo.bankCode}</span>
          </div>
          {paymentInfo.payDate && (
            <div className="detail-row">
              <span className="detail-label">Timestamp:</span>
              <span className="detail-value">{paymentInfo.payDate}</span>
            </div>
          )}
        </div>

        <div className="action-group">
          <Button
            type="primary"
            icon={<WalletOutlined />}
            className="result-btn btn-wallet"
            onClick={() => navigate("/wallet")}
          >
            Go to Wallet
          </Button>
          <Button
            icon={<HomeOutlined />}
            className="result-btn btn-home"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
      </Card>
    </main>
  );
}
