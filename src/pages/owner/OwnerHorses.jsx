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
import { Link, useSearchParams } from "react-router-dom";
import {
  createHorse,
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

const horses = [
  {
    id: 1,
    name: "Thunder",
    breed: "Arabian",
    age: 4,
    status: "Active",
  },
  {
    id: 2,
    name: "Storm",
    breed: "Thoroughbred",
    age: 5,
    status: "Active",
  },
];

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

export default function OwnerHorses() {
  const [searchParams, setSearchParams] = useSearchParams();
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
      openCreateModal();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  function openCreateModal() {
    setEditingHorse(null);
    form.resetFields();
    form.setFieldsValue({ horseStatus: "Active" });
    setModalOpen(true);
  }

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
      } else {
        await createHorse(payload);
        messageApi.success("Horse created");
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
    { title: "Age", dataIndex: "age", responsive: ["md"] },
    { title: "Gender", dataIndex: "gender", responsive: ["lg"] },
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
    {
      title: "Action",
      key: "action",
      width: 210,
      render: (_, record) => (
        <Space wrap>
          <Link to={`/owner/horses/${record.id}`}>Detail</Link>
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
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {contextHolder}

      {errorMessage && <Alert type="warning" showIcon message={errorMessage} />}

      <Card
        title="My horses"
        extra={
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search horse"
              style={{ width: 220 }}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onSearch={setKeyword}
            />
            <Select
              value={statusFilter}
              style={{ width: 150 }}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All status" },
                ...STATUS_OPTIONS,
              ]}
            />
            <Button onClick={loadHorses}>Refresh</Button>
            <Button type="primary" onClick={openCreateModal}>
              Add horse
            </Button>
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
        title={editingHorse ? `Edit ${editingHorse.name}` : "Add horse"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText={editingHorse ? "Save changes" : "Create horse"}
        destroyOnHidden
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{ horseStatus: "Active" }}
        >
          <Form.Item
            label="Horse name"
            name="name"
            rules={[{ required: true, message: "Enter horse name" }]}
          >
            <Input placeholder="Midnight Arrow" />
          </Form.Item>

          <Form.Item label="Breed" name="breed">
            <Input placeholder="Thoroughbred" />
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
            <Input placeholder="Bay" />
          </Form.Item>

          <Form.Item label="Status" name="horseStatus">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Notes for this horse" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
