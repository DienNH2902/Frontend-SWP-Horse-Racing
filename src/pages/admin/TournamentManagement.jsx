import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "antd/dist/reset.css";
import {
  createTournament,
  deleteTournament,
  getTournamentAdvancements,
  getTournamentById,
  getTournaments,
  updateTournament,
  updateTournamentStatus,
} from "../../api/services/tournament.service";

const { Title, Text } = Typography;

const TOURNAMENT_STATUSES = [
  "Preparing",
  "Registration",
  "Upcoming",
  "Ongoing",
  "Completed",
  "Canceled",
];

function resolveList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.tournaments)) return response.tournaments;
  return [];
}

function formatMoney(value) {
  if (value === undefined || value === null) return "N/A";
  return Number(value).toLocaleString("vi-VN") + " VND";
}

function formatDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function normalizeAdvancement(item, index) {
  const horse = item?.horseId || item?.horse || {};
  const fromRace = item?.fromRaceId || item?.fromRace || {};

  return {
    key: item?._id || item?.id || `advancement-${index}`,
    horseName: horse?.name || "N/A",
    horseColor: horse?.color || "N/A",
    fromRaceName: fromRace?.name || "N/A",
    advancedAt: item?.advancedAt || item?.createdAt || "",
  };
}

function statusColor(status) {
  switch (status) {
    case "Preparing":
      return "blue";
    case "Registration":
      return "green";
    case "Upcoming":
      return "cyan";
    case "Ongoing":
      return "gold";
    case "Completed":
      return "purple";
    case "Canceled":
      return "red";
    default:
      return "default";
  }
}

function normalizeTournament(item, index) {
  const id = item?._id || item?.id || `tournament-${index}`;

  return {
    key: id,
    id,
    title: item?.title || "Untitled",
    startDate: item?.startDate || "",
    endDate: item?.endDate || "",
    location: item?.location || "",
    status: item?.status || "Preparing",
    availableSlot: item?.availableSlot ?? "N/A",
  };
}

function normalizeTournamentDetail(item) {
  const id = item?._id || item?.id;

  return {
    key: id,
    id,
    title: item?.title || "Untitled",
    description: item?.description || "",
    imageUrl: item?.imageUrl || "",
    startDate: item?.startDate || "",
    endDate: item?.endDate || "",
    location: item?.location || "",
    status: item?.status || "Preparing",
    totalRounds: item?.totalRounds ?? 0,
    horsesPerRace: item?.horsesPerRace ?? 0,
    totalRaces: item?.totalRaces ?? 0,
    entryFee: item?.entryFee ?? 0,
    availableSlot: item?.availableSlot ?? "N/A",
  };
}

function TournamentManagement() {
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  const [tournaments, setTournaments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [changingStatusTournament, setChangingStatusTournament] =
    useState(null);

  const [detailTournament, setDetailTournament] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [advancementTournament, setAdvancementTournament] = useState(null);
  const [advancements, setAdvancements] = useState([]);
  const [isAdvancementsLoading, setIsAdvancementsLoading] = useState(false);

  async function loadTournaments(status = filterStatus) {
    setIsLoading(true);

    try {
      const response = await getTournaments(status);
      setTournaments(resolveList(response).map(normalizeTournament));
    } catch (error) {
      message.error(error?.message || "Unable to load tournaments");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTournaments();
  }, []);

  function openCreateModal() {
    setEditingTournament(null);
    form.resetFields();
    form.setFieldsValue({
      imageUrl: "",
      totalRounds: 2,
      horsesPerRace: 8,
      totalRaces: 2,
      entryFee: 500000,
    });
    setIsTournamentModalOpen(true);
  }

  async function openDetailModal(record) {
    setIsLoading(true);

    try {
      const response = await getTournamentById(record.id);

      setDetailTournament(response);
      setIsDetailModalOpen(true);
    } catch (error) {
      message.error(error?.message || "Unable to load tournament detail");
    } finally {
      setIsLoading(false);
    }
  }

  async function openEditModal(record) {
    setIsLoading(true);

    try {
      const response = await getTournamentById(record.id);
      const tournament = normalizeTournamentDetail(response);

      setEditingTournament(tournament);
      setIsTournamentModalOpen(true);

      form.setFieldsValue({
        title: tournament.title,
        description: tournament.description,
        imageUrl: tournament.imageUrl,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        location: tournament.location,
        totalRounds: tournament.totalRounds,
        horsesPerRace: tournament.horsesPerRace,
        totalRaces: tournament.totalRaces,
        entryFee: tournament.entryFee,
      });
    } catch (error) {
      message.error(error?.message || "Unable to load tournament detail");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveTournament() {
    const values = await form.validateFields();

    setIsSaving(true);

    try {
      if (editingTournament) {
        await updateTournament(editingTournament.id, values);
        message.success("Tournament updated");
      } else {
        await createTournament(values);
        message.success("Tournament created");
      }

      setEditingTournament(null);
      setIsTournamentModalOpen(false);
      form.resetFields();
      await loadTournaments();
    } catch (error) {
      message.error(error?.message || "Unable to save tournament");
    } finally {
      setIsSaving(false);
    }
  }

  function openStatusModal(record) {
    setChangingStatusTournament(record);
    statusForm.setFieldsValue({
      status: record.status,
    });
  }

  async function handleUpdateStatus() {
    const values = await statusForm.validateFields();

    setIsSaving(true);

    try {
      await updateTournamentStatus(changingStatusTournament.id, values.status);
      message.success("Status updated");

      setChangingStatusTournament(null);
      await loadTournaments();
    } catch (error) {
      message.error(error?.message || "Unable to update status");
    } finally {
      setIsSaving(false);
    }
  }

  async function openAdvancementsModal(record) {
    setAdvancementTournament(record);
    setAdvancements([]);
    setIsAdvancementsLoading(true);

    try {
      const response = await getTournamentAdvancements(record.id);
      const nextAdvancements = resolveList(response)
        .map(normalizeAdvancement)
        .sort(
          (a, b) =>
            new Date(b.advancedAt).getTime() - new Date(a.advancedAt).getTime(),
        );

      setAdvancements(nextAdvancements);
    } catch (error) {
      message.error(error?.message || "Unable to load advancements");
    } finally {
      setIsAdvancementsLoading(false);
    }
  }

  async function handleDeleteTournament(record) {
    setIsSaving(true);

    try {
      await deleteTournament(record.id);
      message.success("Tournament deleted");
      await loadTournaments();
    } catch (error) {
      message.error(error?.message || "Unable to delete tournament");
    } finally {
      setIsSaving(false);
    }
  }

  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        fixed: "left",
        width: 260,
        render: (value) => <Text strong>{value}</Text>,
      },
      {
        title: "Start Date",
        dataIndex: "startDate",
        width: 130,
      },
      {
        title: "End Date",
        dataIndex: "endDate",
        width: 130,
      },
      {
        title: "Location",
        dataIndex: "location",
        width: 260,
        ellipsis: true,
      },
      {
        title: "Status",
        dataIndex: "status",
        width: 140,
        render: (status) => <Tag color={statusColor(status)}>{status}</Tag>,
      },
      {
        title: "Available Slot",
        dataIndex: "availableSlot",
        width: 130,
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 210,
        render: (_, record) => (
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(record)}
            />

            <Tooltip title="View advancements">
              <Button
                type="text"
                icon={<TrophyOutlined />}
                onClick={() => openAdvancementsModal(record)}
              />
            </Tooltip>

            <Button
              className="tournament-management-link-btn"
              size="small"
              onClick={() => openEditModal(record)}
            >
              Edit
            </Button>

            <Button
              className="tournament-management-link-btn"
              size="small"
              onClick={() => openStatusModal(record)}
            >
              Status
            </Button>

            <Popconfirm
              title="Delete tournament?"
              description="This action cannot be undone."
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, loading: isSaving }}
              onConfirm={() => handleDeleteTournament(record)}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [isSaving],
  );

  return (
    <section className="tournament-management">
      <style>{`
        .tournament-management-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .tournament-management-kicker {
          color: #007a68;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .tournament-management-header h1.ant-typography {
          margin: 6px 0 0;
          color: #06332e;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          font-weight: 950;
          letter-spacing: 0;
        }

        .tournament-management-card {
          border: 1px solid #ccefe7;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 22px 70px rgba(13, 70, 63, 0.08);
          overflow: hidden;
        }

        .tournament-management-table.ant-table-wrapper .ant-table-thead > tr > th {
          color: #52726e;
          background: #f3fffc;
          font-weight: 950;
        }

        .tournament-management-table.ant-table-wrapper .ant-table-tbody > tr > td {
          color: #0d2321;
        }

        .tournament-management-link-btn.ant-btn {
          border-color: #bdeee5;
          color: #006755;
          font-weight: 850;
        }

        .tournament-management-link-btn.ant-btn:hover {
          border-color: #69f8dd !important;
          color: #006755 !important;
        }

        .tournament-management-primary.ant-btn {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        .tournament-management-primary.ant-btn:hover {
          border-color: transparent !important;
          color: #06332e !important;
          background: #75ffe6 !important;
        }

        .tournament-management-edit-modal .ant-modal-content {
          border-radius: 8px;
        }

        @media (max-width: 920px) {
          .tournament-management-header {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="tournament-management-header">
        <div>
          <div className="tournament-management-kicker">Admin dashboard</div>
          <Title level={1}>Tournament Management</Title>
        </div>

        <Space>
          <Select
            value={filterStatus}
            style={{ width: 170 }}
            options={[
              { label: "All", value: "" },
              ...TOURNAMENT_STATUSES.map((status) => ({
                label: status,
                value: status,
              })),
            ]}
            onChange={(value) => {
              setFilterStatus(value);
              loadTournaments(value);
            }}
          />

          <Button
            className="tournament-management-link-btn"
            onClick={() => loadTournaments()}
          >
            Refresh
          </Button>

          <Button
            className="tournament-management-primary"
            onClick={openCreateModal}
          >
            Create Tournament
          </Button>
        </Space>
      </div>

      <div className="tournament-management-card">
        <Table
          className="tournament-management-table"
          columns={columns}
          dataSource={tournaments}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `${total} tournaments`,
          }}
          scroll={{ x: 1650 }}
        />
      </div>

      <Modal
        className="tournament-management-edit-modal"
        title={editingTournament ? "Edit Tournament" : "Create Tournament"}
        open={isTournamentModalOpen}
        okText={editingTournament ? "Update" : "Create"}
        cancelText="Cancel"
        confirmLoading={isSaving}
        onOk={handleSaveTournament}
        onCancel={() => {
          setEditingTournament(null);
          setIsTournamentModalOpen(false);
          form.resetFields();
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Image URL" name="imageUrl">
            <Input />
          </Form.Item>

          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[{ required: true, message: "Start date is required" }]}
          >
            <Input placeholder="dd/MM/yyyy" />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            rules={[{ required: true, message: "End date is required" }]}
          >
            <Input placeholder="dd/MM/yyyy" />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: "Location is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Total Rounds" name="totalRounds">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Horses Per Race" name="horsesPerRace">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Total Races" name="totalRaces">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Entry Fee" name="entryFee">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        className="tournament-management-edit-modal"
        title="Update Tournament Status"
        open={Boolean(changingStatusTournament)}
        okText="Update"
        cancelText="Cancel"
        confirmLoading={isSaving}
        onOk={handleUpdateStatus}
        onCancel={() => setChangingStatusTournament(null)}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select
              options={TOURNAMENT_STATUSES.map((status) => ({
                label: status,
                value: status,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Advancements - ${advancementTournament?.title || ""}`}
        open={Boolean(advancementTournament)}
        footer={null}
        width={850}
        onCancel={() => {
          setAdvancementTournament(null);
          setAdvancements([]);
        }}
        destroyOnClose
      >
        <Table
          rowKey="key"
          loading={isAdvancementsLoading}
          dataSource={advancements}
          pagination={false}
          locale={{ emptyText: "No horses have advanced yet" }}
          columns={[
            {
              title: "Horse",
              dataIndex: "horseName",
              render: (value) => <Text strong>{value}</Text>,
            },
            {
              title: "Color",
              dataIndex: "horseColor",
              width: 140,
            },
            {
              title: "From Race",
              dataIndex: "fromRaceName",
            },
            {
              title: "Advanced At",
              dataIndex: "advancedAt",
              width: 180,
              render: formatDateTime,
            },
          ]}
        />
      </Modal>

      <Modal
        title="Tournament Detail"
        open={isDetailModalOpen}
        footer={null}
        width={700}
        onCancel={() => {
          setDetailTournament(null);
          setIsDetailModalOpen(false);
        }}
      >
        {detailTournament && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <p>
              <strong>Title:</strong> {detailTournament.title}
            </p>

            <p>
              <strong>Description:</strong> {detailTournament.description}
            </p>

            <p>
              <strong>Location:</strong> {detailTournament.location}
            </p>

            <p>
              <strong>Start Date:</strong> {detailTournament.startDate}
            </p>

            <p>
              <strong>End Date:</strong> {detailTournament.endDate}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <Tag color={statusColor(detailTournament.status)}>
                {detailTournament.status}
              </Tag>
            </p>

            <p>
              <strong>Total Rounds:</strong> {detailTournament.totalRounds}
            </p>

            <p>
              <strong>Horses Per Race:</strong> {detailTournament.horsesPerRace}
            </p>

            <p>
              <strong>Total Races:</strong> {detailTournament.totalRaces}
            </p>

            <p>
              <strong>Available Slot:</strong> {detailTournament.availableSlot}
            </p>

            <p>
              <strong>Entry Fee:</strong>{" "}
              {formatMoney(detailTournament.entryFee)}
            </p>

            {detailTournament.imageUrl && (
              <img
                src={detailTournament.imageUrl}
                alt={detailTournament.title}
                style={{
                  width: "100%",
                  borderRadius: 8,
                }}
              />
            )}
          </Space>
        )}
      </Modal>
    </section>
  );
}

export default TournamentManagement;
