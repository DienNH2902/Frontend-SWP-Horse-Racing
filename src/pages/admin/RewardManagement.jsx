import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import "antd/dist/reset.css";
import {
  createReward,
  getRewards,
  updateReward,
  deleteReward,
} from "../../api/services/reward.service";

const { Text, Title } = Typography;

function pick(source, keys, fallback = "") {
  for (const key of keys) {
    if (source?.[key] !== undefined && source?.[key] !== null) {
      return source[key];
    }
  }
  return fallback;
}

function resolveList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.rewards)) return response.rewards;
  return [];
}

function normalizeReward(reward, index) {
  const id = pick(reward, ["id", "_id", "rewardId"], `reward-${index}`);
  return {
    key: id,
    id,
    title: pick(reward, ["title"], "Unnamed Reward"),
    conditionType: pick(reward, ["conditionType"], "SHOP"),
    requiredValue:
      reward?.requiredValue !== undefined ? Number(reward.requiredValue) : 0,
    rewardType: pick(reward, ["rewardType"], "POINTS"),
    rewardValue: pick(reward, ["rewardValue"], "0"),
    description: pick(reward, ["description"], "N/A"),
  };
}

function conditionColor(type) {
  const normalized = String(type).toUpperCase();
  if (normalized === "MILESTONE") return "blue";
  if (normalized === "SHOP") return "orange";
  return "default";
}

function rewardTypeColor(type) {
  const normalized = String(type).toUpperCase();
  if (normalized === "POINTS") return "green";
  if (normalized === "AVATAR_FRAME") return "gold";
  if (normalized === "BACKGROUND") return "purple";
  if (normalized === "INSURANCE_CARD") return "magenta";
  return "cyan";
}

function RewardManagement() {
  const [form] = Form.useForm();
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedRewardType, setSelectedRewardType] = useState(null);

  async function loadRewards() {
    setIsLoading(true);
    try {
      const response = await getRewards();
      setRewards(resolveList(response).map(normalizeReward));
    } catch (error) {
      message.error(
        error?.message || "Không thể tải danh sách cấu hình phần thưởng",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      const matchCondition = selectedCondition
        ? reward.conditionType === selectedCondition
        : true;
      const matchType = selectedRewardType
        ? reward.rewardType === selectedRewardType
        : true;
      return matchCondition && matchType;
    });
  }, [rewards, selectedCondition, selectedRewardType]);

  useEffect(() => {
    loadRewards();
  }, []);

  function openCreateModal() {
    setEditingReward(null);
    form.resetFields();
    setIsModalOpen(true);
  }

  function openEditModal(reward) {
    setEditingReward(reward);
    form.setFieldsValue({
      title: reward.title,
      conditionType: reward.conditionType,
      requiredValue: reward.requiredValue,
      rewardType: reward.rewardType,
      rewardValue: reward.rewardValue,
      description: reward.description === "N/A" ? "" : reward.description,
    });
    setIsModalOpen(true);
  }

  async function handleSave() {
    const values = await form.validateFields();
    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title,
        conditionType: values.conditionType,
        requiredValue: Number(values.requiredValue),
        rewardType: values.rewardType,
        rewardValue: values.rewardValue,
        description: values.description || "",
      };

      if (editingReward) {
        await updateReward(editingReward.id, payload);
        message.success("Cập nhật phần thưởng thành công");
      } else {
        await createReward(payload);
        message.success("Tạo mới phần thưởng thành công");
      }

      setIsModalOpen(false);
      loadRewards();
    } catch (error) {
      message.error(error?.message || "Thao tác thất bại");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReward(id);
      message.success("Xóa cấu hình phần thưởng thành công");
      setRewards((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      message.error(error?.message || "Không thể xóa phần thưởng");
    }
  }

  const columns = useMemo(
    () => [
      {
        title: "Tên phần thưởng",
        dataIndex: "title",
        fixed: "left",
        width: 220,
        render: (value) => <Text strong>{value}</Text>,
      },
      {
        title: "Loại điều kiện",
        dataIndex: "conditionType",
        width: 140,
        render: (type) => <Tag color={conditionColor(type)}>{type}</Tag>,
      },
      {
        title: "Giá trị yêu cầu",
        dataIndex: "requiredValue",
        width: 140,
        render: (val) => <Text>{val.toLocaleString()}đ</Text>,
      },
      {
        title: "Loại phần quà",
        dataIndex: "rewardType",
        width: 160,
        render: (type) => <Tag color={rewardTypeColor(type)}>{type}</Tag>,
      },
      {
        title: "Giá trị quà nhận",
        dataIndex: "rewardValue",
        width: 240,
        ellipsis: true,
      },
      {
        title: "Mô tả cơ chế",
        dataIndex: "description",
        width: 280,
        ellipsis: true,
      },
      {
        title: "Hành động quản trị",
        key: "actions",
        fixed: "right",
        width: 160,
        render: (_, record) => (
          <Space>
            <Button
              className="user-management-link-btn"
              size="small"
              onClick={() => openEditModal(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Xóa phần thưởng này?"
              description="Hành động này sẽ loại bỏ cấu hình khỏi hệ thống."
              okText="Xóa"
              cancelText="Hủy"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button danger size="small">
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [rewards],
  );

  return (
    <section className="user-management">
      <style>{`
        .user-management-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .user-management-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          width: auto;
        }

        .user-management-kicker {
          color: #007a68;
          font-size: 13px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .user-management-header h1.ant-typography {
          margin: 6px 0 0;
          color: #06332e;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          font-weight: 950;
        }

        .user-management-card {
          border: 1px solid #ccefe7;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 22px 70px rgba(13, 70, 63, 0.08);
          overflow: hidden;
        }

        .user-management-table.ant-table-wrapper .ant-table-thead > tr > th {
          color: #52726e;
          background: #f3fffc;
          font-weight: 950;
        }

        .user-management-link-btn.ant-btn {
          border-color: #bdeee5;
          color: #006755;
          font-weight: 850;
          background: #fff;
        }

        .user-management-link-btn.ant-btn:hover {
          border-color: #69f8dd !important;
          color: #006755 !important;
        }

        .user-management-refresh.ant-btn {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        .user-management-refresh.ant-btn:hover {
          border-color: transparent !important;
          color: #06332e !important;
          background: #75ffe6 !important;
        }

        @media (max-width: 920px) {
          .user-management-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="user-management-header">
        <div>
          <div className="user-management-kicker">Admin dashboard</div>
          <Title level={1}>Rewards Management</Title>
        </div>
        <div className="user-management-actions">
          <Select
            placeholder="Lọc theo điều kiện"
            allowClear
            style={{ width: 170 }}
            onChange={(val) => setSelectedCondition(val)}
          >
            <Select.Option value="MILESTONE">
              MILESTONE (Mốc điểm)
            </Select.Option>
            <Select.Option value="SHOP">SHOP (Cửa hàng)</Select.Option>
          </Select>

          <Select
            placeholder="Lọc theo loại quà"
            allowClear
            style={{ width: 170 }}
            onChange={(val) => setSelectedRewardType(val)}
          >
            <Select.Option value="POINTS">POINTS</Select.Option>
            <Select.Option value="AVATAR_FRAME">AVATAR_FRAME</Select.Option>
            <Select.Option value="BACKGROUND">BACKGROUND</Select.Option>
            <Select.Option value="INSURANCE_CARD">INSURANCE_CARD</Select.Option>
          </Select>

          <Button type="primary" onClick={openCreateModal}>
            Tạo quà tặng mới
          </Button>
          <Button className="user-management-refresh" onClick={loadRewards}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="user-management-card">
        <Table
          className="user-management-table"
          columns={columns}
          dataSource={filteredRewards}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} cấu hình vật phẩm`,
          }}
          scroll={{ x: 1300 }}
        />
      </div>

      <Modal
        title={
          editingReward
            ? "Chỉnh sửa cấu hình phần thưởng"
            : "Tạo mới phần thưởng hệ thống"
        }
        open={isModalOpen}
        okText={editingReward ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        confirmLoading={isSubmitting}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên phần thưởng / vật phẩm"
            name="title"
            rules={[
              { required: true, message: "Vui lòng nhập tên phần thưởng" },
            ]}
          >
            <Input placeholder="Ví dụ: Thẻ Bảo Hiểm Cược Thua 2" />
          </Form.Item>

          <Form.Item
            label="Loại điều kiện"
            name="conditionType"
            rules={[
              { required: true, message: "Vui lòng chọn loại điều kiện" },
            ]}
          >
            <Select placeholder="Chọn loại điều kiện">
              <Select.Option value="MILESTONE">
                MILESTONE (Đạt mốc tổng tích lũy)
              </Select.Option>
              <Select.Option value="SHOP">
                SHOP (Mua bằng ví pointBalance)
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá trị yêu cầu (Mốc điểm / Giá tiền ví)"
            name="requiredValue"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập giá trị tích lũy yêu cầu",
              },
            ]}
          >
            <Input type="number" min={0} placeholder="Ví dụ: 500" />
          </Form.Item>

          <Form.Item
            label="Thể loại phần quà"
            name="rewardType"
            rules={[{ required: true, message: "Vui lòng chọn thể loại quà" }]}
          >
            <Select placeholder="Chọn thể loại quà tác động">
              <Select.Option value="POINTS">
                POINTS (Cộng điểm trực tiếp)
              </Select.Option>
              <Select.Option value="AVATAR_FRAME">
                AVATAR_FRAME (Khung ảnh)
              </Select.Option>
              <Select.Option value="BACKGROUND">
                BACKGROUND (Hình nền)
              </Select.Option>
              <Select.Option value="INSURANCE_CARD">
                INSURANCE_CARD (Thẻ bảo hiểm cược)
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá trị quà nhận (Số điểm cộng / Đường dẫn URL hình ảnh / Mã cấu hình)"
            name="rewardValue"
            rules={[
              { required: true, message: "Vui lòng nhập giá trị của quà nhận" },
            ]}
          >
            <Input placeholder="Ví dụ: INSURANCE_LVL1 hoặc URL khung ảnh" />
          </Form.Item>

          <Form.Item label="Mô tả chi tiết vật phẩm" name="description">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả tác dụng của vật phẩm..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

export default RewardManagement;
