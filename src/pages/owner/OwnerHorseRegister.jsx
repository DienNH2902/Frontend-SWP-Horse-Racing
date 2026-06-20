import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { createHorse } from "../../api/services/horse.service";
import { HORSE_STATUS_OPTIONS, toHorseCreatePayload } from "./horseViewModel";

export default function OwnerHorseRegister() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  async function handleSubmit(values) {
    try {
      await createHorse(toHorseCreatePayload(values));
      messageApi.success("Horse registered");

      navigate("/owner/horses");
    } catch (error) {
      messageApi.error(error.message || "Could not register horse.");
    }
  }

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {contextHolder}

      <Card>
        <Space direction="vertical" size={4}>
          <Typography.Title level={3} className="owner-section-title">
            Register new horse
          </Typography.Title>
          <Typography.Text type="secondary">
            Add a horse to your stable before choosing a jockey or registering for a tournament.
          </Typography.Text>
        </Space>
      </Card>

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ horseStatus: "IDLE", imageUrl: "" }}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Horse name"
                name="name"
                rules={[{ required: true, message: "Enter horse name" }]}
              >
                <Input placeholder="Xích Thố" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Color"
                name="color"
                rules={[{ required: true, message: "Enter horse color" }]}
              >
                <Input placeholder="Đỏ hạt dẻ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Height (m)"
                name="height"
                rules={[{ required: true, message: "Enter height" }]}
              >
                <InputNumber min={0} precision={2} className="owner-input-full" placeholder="1.65" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Weight (kg)"
                name="weight"
                rules={[{ required: true, message: "Enter weight" }]}
              >
                <InputNumber min={0} precision={1} className="owner-input-full" placeholder="450" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Image URL" name="imageUrl">
            <Input placeholder="https://example.com/horse.png" />
          </Form.Item>

          <Form.Item label="Status" name="horseStatus">
            <Select options={HORSE_STATUS_OPTIONS} />
          </Form.Item>

          <Space wrap>
            <Button type="primary" htmlType="submit">
              Register horse
            </Button>
            <Button onClick={() => navigate("/owner/horses")}>Cancel</Button>
          </Space>
        </Form>
      </Card>
    </Space>
  );
}
