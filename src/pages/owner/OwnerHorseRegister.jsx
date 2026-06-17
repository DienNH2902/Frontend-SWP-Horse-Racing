import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { createHorse } from "../../api/services/horse.service";
import { toHorsePayload } from "./horseViewModel";

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Training", label: "Training" },
  { value: "Inactive", label: "Inactive" },
  { value: "Injured", label: "Injured" },
];

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Gelding", label: "Gelding" },
];

export default function OwnerHorseRegister() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  async function handleSubmit(values) {
    try {
      const horse = await createHorse(toHorsePayload(values));
      messageApi.success("Horse registered");
      navigate(`/owner/horses/${horse.id}`);
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
          initialValues={{ horseStatus: "Active" }}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Horse name"
                name="name"
                rules={[{ required: true, message: "Enter horse name" }]}
              >
                <Input placeholder="Midnight Arrow" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={12}>
              <Form.Item
                label="Breed"
                name="breed"
                rules={[{ required: true, message: "Enter breed" }]}
              >
                <Input placeholder="Thoroughbred" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label="Age"
                name="age"
                rules={[{ required: true, message: "Enter age" }]}
              >
                <InputNumber min={0} max={40} className="owner-input-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Gender" name="gender">
                <Select allowClear options={GENDER_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Height (m)" name="height">
                <InputNumber min={0} precision={2} className="owner-input-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Form.Item label="Weight (kg)" name="weight">
                <InputNumber min={0} precision={1} className="owner-input-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <Form.Item label="Color" name="color">
                <Input placeholder="Bay" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Stable" name="stable">
                <Input placeholder="Stable A" />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Status" name="horseStatus">
                <Select options={STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} placeholder="Training notes, temperament, medical notes" />
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
