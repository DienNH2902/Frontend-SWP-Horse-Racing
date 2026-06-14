import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  requestResetPassword,
  resetPassword,
} from "../../../api/services/otp.service";

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
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    key: (
      <>
        <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </>
    ),
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m13 5 7 7-7 7" />
      </>
    ),
    arrowLeft: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  async function handleRequestOTP(values) {
    setIsSubmitting(true);
    try {
      await requestResetPassword({ email: values.email });
      message.success(
        "Mã xác thực OTP đã được gửi tới Email của bạn thành công",
      );
      setUserEmail(values.email);
      setStep(2);
    } catch (error) {
      message.error(
        error?.message || "Không thể gửi yêu cầu. Vui lòng kiểm tra lại email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(values) {
    setIsSubmitting(true);
    try {
      await resetPassword({
        email: userEmail,
        code: values.code,
        newPassword: values.newPassword,
      });
      message.success("Đặt lại mật khẩu mới thành công!");
      navigate("/login", { replace: true });
    } catch (error) {
      message.error(
        error?.message || "Xác thực OTP thất bại hoặc mã đã hết hạn.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 1) {
    return (
      <Form
        className="gh-ant-form"
        layout="vertical"
        onFinish={handleRequestOTP}
        requiredMark={false}
      >
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Email is invalid" },
          ]}
        >
          <Input
            className="gh-ant-input"
            autoComplete="email"
            placeholder="goldenhoof@example.com"
            prefix={<Icon name="mail" size={22} />}
          />
        </Form.Item>

        <Form.Item shouldUpdate noStyle>
          {() => (
            <Button
              block
              className="gh-login-btn"
              htmlType="submit"
              loading={isSubmitting}
            >
              <span>Send Verification Code</span>
              <Icon name="arrowRight" />
            </Button>
          )}
        </Form.Item>

        <p className="gh-signup">
          Remember your password?{" "}
          <Link className="gh-link" to="/login">
            Log in
          </Link>
        </p>
      </Form>
    );
  }

  return (
    <Form
      form={form}
      className="gh-ant-form"
      layout="vertical"
      onFinish={handleResetPassword}
      requiredMark={false}
    >
      <div
        style={{
          marginBottom: "18px",
          color: "rgba(244, 255, 251, 0.72)",
          fontSize: "14px",
          background: "rgba(94, 248, 216, 0.06)",
          padding: "12px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(94, 248, 216, 0.16)",
          lineHeight: "1.5",
        }}
      >
        Mã OTP đang được gửi đến địa chỉ:{" "}
        <strong
          style={{
            color: "#5ef8d8",
            display: "block",
            wordBreak: "break-all",
            marginTop: "2px",
          }}
        >
          {userEmail}
        </strong>
      </div>

      <Form.Item
        label="Verification Code"
        name="code"
        rules={[
          { required: true, message: "OTP code is required" },
          { len: 6, message: "OTP must be exactly 6 characters" },
        ]}
      >
        <Input
          className="gh-ant-input"
          placeholder="Enter 6-digit code"
          maxLength={6}
          prefix={<Icon name="key" size={22} />}
        />
      </Form.Item>

      <Form.Item
        label="New Password"
        name="newPassword"
        rules={[
          { required: true, message: "New password is required" },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
      >
        <Input.Password
          className="gh-ant-input"
          placeholder="Enter new password"
          prefix={<Icon name="lock" size={22} />}
        />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Please confirm your password" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The two passwords do not match"),
              );
            },
          }),
        ]}
      >
        <Input.Password
          className="gh-ant-input"
          placeholder="Confirm new password"
          prefix={<Icon name="lock" size={22} />}
        />
      </Form.Item>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginTop: "6px",
        }}
      >
        <Form.Item shouldUpdate noStyle>
          {() => (
            <Button
              block
              className="gh-login-btn"
              htmlType="submit"
              loading={isSubmitting}
            >
              <span>Reset Password</span>
              <Icon name="arrowRight" />
            </Button>
          )}
        </Form.Item>

        <Button
          block
          type="text"
          style={{
            color: "rgba(244, 255, 251, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            height: "44px",
            fontWeight: 700,
            fontSize: "14px",
          }}
          onClick={() => {
            setStep(1);
            form.resetFields();
          }}
        >
          <Icon name="arrowLeft" size={16} />
          <span>Change Email Address</span>
        </Button>
      </div>
    </Form>
  );
}
