import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  deleteHorse,
  getMyHorses,
  updateHorse,
} from "../../api/services/horse.service";
import {
  getHorseStatusColor,
  horseCollectionFrom,
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

export default function OwnerHorses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHorse, setEditingHorse] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");

  const loadHorses = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await getMyHorses();
      setHorses(horseCollectionFrom(data));
    } catch (error) {
      console.error(error);
      setHorses([]);
      setErrorMessage(error.message || "Could not load horses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHorses();
  }, [loadHorses]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      navigate("/owner/horses/register", { replace: true });
      setSearchParams({}, { replace: true });
    }
  }, [navigate, searchParams, setSearchParams]);

  const rows = useMemo(() => horses.map(normalizeHorse), [horses]);

  const filteredRows = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    return rows.filter((horse) => {
      const matchesKeyword =
        !query ||
        [horse.name, horse.breed, horse.color, horse.ownerName]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        String(horse.status).toLowerCase() === String(statusFilter).toLowerCase();

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, rows, statusFilter]);

  function openEditModal(horse) {
    setEditingHorse(horse);
    form.setFieldsValue(toHorseFormValues(horse));
    setModalOpen(true);
  }

  async function handleSubmit(values) {
    setSaving(true);

    try {
      const payload = toHorsePayload(values);

      if (editingHorse?.id) {
        await updateHorse(editingHorse.id, payload);
        messageApi.success("Horse updated");
      }

      setModalOpen(false);
      setEditingHorse(null);
      form.resetFields();
      await loadHorses();
    } catch (error) {
      console.error(error);
      messageApi.error(error.message || "Could not save horse.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(horse) {
    if (!horse?.id) {
      messageApi.error("Missing horse id.");
      return;
    }

    try {
      await deleteHorse(horse.id);
      messageApi.success("Horse deleted");
      await loadHorses();
    } catch (error) {
      console.error(error);
      messageApi.error(error.message || "Could not delete horse.");
    }
  }

  const columns = [
    {
      title: "Horse",
      dataIndex: "name",
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">{record.breed}</Typography.Text>
        </Space>
      ),
    },
    { title: "Color", dataIndex: "color", responsive: ["lg"] },
    {
      title: "Status",
      dataIndex: "status",
      render: (value) => <Tag color={getHorseStatusColor(value)}>{value}</Tag>,
    },
    {
      title: "Win rate",
      dataIndex: "winRate",
      render: (value) => `${value || 0}%`,
      responsive: ["md"],
    },
    { title: "Starts", dataIndex: "starts", responsive: ["lg"] },
    { title: "Rating", dataIndex: "rating", responsive: ["lg"] },
    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space wrap>
          <Button size="small" onClick={() => openEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete horse?"
            description="This action cannot be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} className="owner-page-stack">
      {contextHolder}

      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Card
        title="My horses"
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search horse"
              className="owner-filter-search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={setKeyword}
            />
            <Select
              value={statusFilter}
              className="owner-status-select"
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All status" },
                ...STATUS_OPTIONS,
              ]}
            />
            <Button onClick={loadHorses}>Refresh</Button>
            <Link to="/owner/horses/register">
              <Button type="primary">Register horse</Button>
            </Link>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredRows}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: "No horses match the current filters" }}
        />
      </Card>

      <Modal
        title={`Edit ${editingHorse?.name || "horse"}`}
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
            <Input placeholder="Midnight Arrow" />
          </Form.Item>

          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: "Enter horse color" }]}
          >
            <Input placeholder="Đỏ hạt dẻ" />
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
