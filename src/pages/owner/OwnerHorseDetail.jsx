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
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
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
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
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
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8} lg={6}>
            <Statistic title="Win rate" value={horse.winRate} suffix="%" />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Statistic title="Total wins" value={horse.totalWin} />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Statistic title="Age" value={horse.age} />
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Statistic title="Rating" value={horse.rating} />
          </Col>
        </Row>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Breed">{horse.breed}</Descriptions.Item>
          <Descriptions.Item label="Gender">{horse.gender}</Descriptions.Item>
          <Descriptions.Item label="Color">{horse.color}</Descriptions.Item>
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
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Horse name"
            name="name"
            rules={[{ required: true, message: "Enter horse name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Breed" name="breed">
            <Input />
          </Form.Item>

          <Space size={12} style={{ width: "100%" }} align="start">
            <Form.Item label="Age" name="age" style={{ flex: 1 }}>
              <InputNumber min={0} max={40} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Gender" name="gender" style={{ flex: 1 }}>
              <Select allowClear options={GENDER_OPTIONS} />
            </Form.Item>
          </Space>

          <Space size={12} style={{ width: "100%" }} align="start">
            <Form.Item label="Height (m)" name="height" style={{ flex: 1 }}>
              <InputNumber min={0} precision={2} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Weight (kg)" name="weight" style={{ flex: 1 }}>
              <InputNumber min={0} precision={1} style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item label="Color" name="color">
            <Input />
          </Form.Item>

          <Form.Item label="Status" name="horseStatus">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
