import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
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
  Upload,
  message,
} from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import {
  deleteHorse,
  getMyHorses,
  updateHorse,
  uploadHorseAvatar,
} from "../../api/services/horse.service";
import {
  getHorseStatusColor,
  HORSE_STATUS_OPTIONS,
  horseCollectionFrom,
  normalizeHorse,
  toHorseFormValues,
  toHorsePayload,
} from "./horseViewModel";

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
  const [uploadingHorseId, setUploadingHorseId] = useState("");
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

  function getImageUrl(path) {
    if (!path) return undefined;
    if (String(path).startsWith("http")) return path;

    const base = API_BASE_URL || "";
    const cleanBase = base.endsWith("/") ? base : `${base}/`;
    const cleanPath = String(path).replace(/^\//, "");

    return `${cleanBase}${cleanPath}`;
  }

  function getUploadedImagePath(data) {
    return data?.imageUrl || data?.avatar || data?.avatarUrl || data?.url || data?.path || data;
  }

  function buildHorsePayloadWithImage(horse, imageUrl) {
    return toHorsePayload({
      ...toHorseFormValues(horse),
      imageUrl,
      horseStatus: horse.status,
    });
  }

  async function handleHorseAvatarUpload(horse, { file, onSuccess, onError }) {
    if (!horse?.id) {
      const error = new Error("Missing horse id.");
      messageApi.error(error.message);
      onError(error);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const error = new Error("Image must be smaller than 5MB");
      messageApi.error(error.message);
      onError(error);
      return;
    }

    setUploadingHorseId(horse.id);

    try {
      const uploaded = await uploadHorseAvatar(file);
      const imageUrl = getUploadedImagePath(uploaded);

      if (!imageUrl) {
        throw new Error("Invalid response from server");
      }

      await updateHorse(horse.id, buildHorsePayloadWithImage(horse, imageUrl));
      setHorses((current) =>
        current.map((item) =>
          (item.id ?? item._id) === horse.id
            ? { ...item, imageUrl, avatar: imageUrl, avatarUrl: imageUrl }
            : item,
        ),
      );
      messageApi.success("Horse photo uploaded");
      onSuccess(uploaded);
    } catch (error) {
      console.error(error);
      messageApi.error(error.message || "Could not upload horse photo.");
      onError(error);
    } finally {
      setUploadingHorseId("");
    }
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
        <Space>
          <Upload
            name="file"
            accept="image/*"
            showUploadList={false}
            customRequest={(options) => handleHorseAvatarUpload(record, options)}
            disabled={uploadingHorseId === record.id}
          >
            <button
              type="button"
              className="horse-avatar-upload"
              title="Upload horse photo"
              aria-label={`Upload photo for ${value || "horse"}`}
              disabled={uploadingHorseId === record.id}
            >
              <Avatar size={44} src={getImageUrl(record.imageUrl)}>
                {uploadingHorseId === record.id ? (
                  <CameraOutlined />
                ) : (
                  String(value || "?").charAt(0)
                )}
              </Avatar>
              <span className="horse-avatar-upload-icon">
                <CameraOutlined />
              </span>
            </button>
          </Upload>
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{value}</Typography.Text>
            <Typography.Text type="secondary">{record.breed}</Typography.Text>
          </Space>
        </Space>
      ),
    },
    { title: "Color", dataIndex: "color", responsive: ["lg"] },
    {
      title: "Height",
      dataIndex: "height",
      render: (value) => `${value || 0} m`,
      responsive: ["md"],
    },
    {
      title: "Weight",
      dataIndex: "weight",
      render: (value) => `${value || 0} kg`,
      responsive: ["md"],
    },
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
                ...HORSE_STATUS_OPTIONS,
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
            <Select options={HORSE_STATUS_OPTIONS} />
          </Form.Item>

        </Form>
      </Modal>

      <style>{`
        .horse-avatar-upload {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
        }

        .horse-avatar-upload .ant-avatar {
          flex: 0 0 auto;
          border: 1px solid #d9f3ed;
          background: #f3fffc;
          color: #006755;
          font-weight: 800;
        }

        .horse-avatar-upload-icon {
          position: absolute;
          right: 0;
          bottom: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          background: #006755;
          color: #ffffff;
          font-size: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
        }

        .horse-avatar-upload:hover .ant-avatar {
          border-color: #69f8dd;
          box-shadow: 0 0 0 3px rgba(105, 248, 221, 0.18);
        }

        .horse-avatar-upload:disabled {
          cursor: wait;
          opacity: 0.7;
        }
      `}</style>
    </Space>
  );
}
