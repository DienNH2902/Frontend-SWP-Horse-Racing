import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  message,
} from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteHorse, getHorseById, updateHorse } from "../../api/services/horse.service";
import {
  getHorseStatusColor,
  normalizeHorse,
  toHorseFormValues,
  toHorsePayload,
} from "./horseViewModel";

const STATUS_OPTIONS = [
  { value: "IDLE", label: "IDLE" },
  { value: "TRAINING", label: "TRAINING" },
  { value: "RACING", label: "RACING" },
  { value: "INJURED", label: "INJURED" },
  { value: "RETIRED", label: "RETIRED" },
];

export default function OwnerHorseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadHorse = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getHorseById(id);
      setHorse(data ? normalizeHorse(data) : null);
    } catch (error) {
      setErrorMessage(error.message || "Could not load horse.");
      setHorse(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHorse();
  }, [loadHorse]);

  function openEditModal() {
    if (!horse) return;
    form.setFieldsValue(toHorseFormValues(horse));
    setModalOpen(true);
  }

  async function handleSubmit(values) {
    if (!horse?.id) return;
    setSaving(true);

    try {
      await updateHorse(horse.id, toHorsePayload(values));
      messageApi.success("Horse updated");
      setModalOpen(false);
      await loadHorse();
    } catch (error) {
      console.error(error);
      messageApi.error(error.message || "Could not update horse.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!horse?.id) return;

    try {
      await deleteHorse(horse.id);
      messageApi.success("Horse deleted");
      navigate("/owner/horses", { replace: true });
    } catch (error) {
      console.error(error);
      messageApi.error(error.message || "Could not delete horse.");
    }
  }

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!horse) {
    return (
      <Space direction="vertical" size={16} className="owner-page-stack">
        {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}
        <Result
          status="404"
          title="Horse not found"
          extra={<Link to="/owner/horses">Back to list</Link>}
        />
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {contextHolder}

      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Card
        title={horse.name}
        extra={
          <Space wrap>
            <Tag color={getHorseStatusColor(horse.status)}>{horse.status}</Tag>
            <Link to="/owner/horses">
              <Button>Back</Button>
            </Link>
            <Button type="primary" onClick={openEditModal}>
              Edit
            </Button>
            <Popconfirm
              title="Delete horse?"
              description="This action cannot be undone."
              okText="Delete"
              okButtonProps={{ danger: true }}
              onConfirm={handleDelete}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        }
      >
        <Row gutter={[16, 16]} className="owner-stats-row">
          <Col xs={24} sm={8} lg={6}>
            <Statistic title="Win rate" value={horse.winRate} suffix="%" />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Statistic title="Total wins" value={horse.totalWin} />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Statistic title="Rating" value={horse.rating} />
          </Col>
        </Row>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Color">{horse.color}</Descriptions.Item>
          <Descriptions.Item label="Image URL">{horse.imageUrl || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Height">{horse.height}</Descriptions.Item>
          <Descriptions.Item label="Weight">{horse.weight}</Descriptions.Item>
          <Descriptions.Item label="Owner">{horse.ownerName}</Descriptions.Item>
          <Descriptions.Item label="Stable">{horse.stable}</Descriptions.Item>
          <Descriptions.Item label="Starts">{horse.starts}</Descriptions.Item>
          <Descriptions.Item label="Podiums">{horse.podiums}</Descriptions.Item>
          <Descriptions.Item label="Last race">{horse.lastRace}</Descriptions.Item>
          <Descriptions.Item label="Description">{horse.description}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title={`Edit ${horse.name}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="Save changes"
        destroyOnHidden
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{ horseStatus: "IDLE", imageUrl: "" }}
        >
          <Form.Item
            label="Horse name"
            name="name"
            rules={[{ required: true, message: "Enter horse name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: "Enter horse color" }]}
          >
            <Input />
          </Form.Item>

          <Space size={12} className="owner-form-row" align="start">
            <Form.Item
              label="Height (m)"
              name="height"
              className="owner-form-col"
              rules={[{ required: true, message: "Enter height" }]}
            >
              <InputNumber min={0} precision={2} className="owner-input-full" />
            </Form.Item>
            <Form.Item
              label="Weight (kg)"
              name="weight"
              className="owner-form-col"
              rules={[{ required: true, message: "Enter weight" }]}
            >
              <InputNumber min={0} precision={1} className="owner-input-full" />
            </Form.Item>
          </Space>

          <Form.Item label="Image URL" name="imageUrl">
            <Input placeholder="https://example.com/horse.png" />
          </Form.Item>

          <Form.Item label="Status" name="horseStatus">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

        </Form>
      </Modal>
    </Space>
  );
}
