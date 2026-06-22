import { Button, Checkbox, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../../../api/services/auth.service";
import { saveAuthSession } from "../../../utils/storage";
import { getRoleHomePath } from "../../../utils/roles";

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
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 5 7 7-7 7" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function GoogleLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.12-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Bắt lỗi Redirect từ Google Login gửi về URL Query Parameter
  useEffect(() => {
    const errorMsg = searchParams.get("error");
    if (errorMsg) {
      // Hiển thị thông báo lỗi bằng Antd Message
      message.error(errorMsg);

      // Xóa tham số error khỏi URL để tránh lặp lại thông báo khi người dùng F5 trang
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function handleFinish(values) {
    setIsSubmitting(true);

    try {
      const authSession = await login({
        email: values.email,
        password: values.password,
      });
      const session = {
        ...authSession,
        user: authSession.user || { email: values.email },
      };

      saveAuthSession(session, values.remember);
      message.success("Login successful");
      navigate(getRoleHomePath(session.user?.role), { replace: true });
    } catch (error) {
      message.error(error?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      className="gh-ant-form"
      initialValues={{ remember: true }}
      layout="vertical"
      onFinish={handleFinish}
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

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Password is required" }]}
      >
        <Input.Password
          className="gh-ant-input"
          autoComplete="current-password"
          placeholder="Enter your password"
          prefix={<Icon name="lock" size={22} />}
        />
      </Form.Item>

      <div className="gh-options">
        <Form.Item name="remember" noStyle valuePropName="checked">
          <Checkbox className="gh-ant-checkbox">Remember me</Checkbox>
        </Form.Item>
        <Link className="gh-link" to="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <Form.Item shouldUpdate noStyle>
        {() => (
          <Button
            block
            className="gh-login-btn"
            htmlType="submit"
            loading={isSubmitting}
          >
            <span>Log In</span>
            <Icon name="arrow" />
          </Button>
        )}
      </Form.Item>

      <div className="gh-divider">or</div>

      <a href="https://api.horse-racing.io.vn/auth/google">
        <button className="gh-google-btn" type="button">
          <GoogleLogo />
          <span>Continue with Google</span>
        </button>
      </a>

      <p className="gh-signup">
        Don't have an account?{" "}
        <Link className="gh-link" to="/register">
          Sign up
        </Link>
      </p>
    </Form>
  );
}
