import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Descriptions,
} from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getAllBets } from "../../api/services/bet.service";

dayjs.extend(customParseFormat);

const { Text, Title } = Typography;
const { Search } = Input;

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
  return [];
}

function formatDate(value) {
  if (!value) return "N/A";
  if (typeof value === "string" && value.includes("/")) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function getTimeValue(value) {
  if (!value) return 0;
  if (typeof value === "string" && value.includes("/")) {
    const parsedDate = dayjs(value, "DD/MM/YYYY", true);
    return parsedDate.isValid() ? parsedDate.valueOf() : 0;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getObjectIdTime(value) {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    return 0;
  }
  return parseInt(value.slice(0, 8), 16) * 1000;
}

function sortNewestRequestFirst(a, b) {
  const aTime = Math.max(getTimeValue(a.placedAt), getObjectIdTime(a.id));
  const bTime = Math.max(getTimeValue(b.placedAt), getObjectIdTime(b.id));
  return bTime - aTime;
}

function normalizeBet(item, index) {
  const id = pick(item, ["id", "_id"], `bet-${index}`);
  return {
    key: id,
    id,
    spectatorId: pick(item, ["spectatorId"], "N/A"),
    raceId: pick(item, ["raceId"], "N/A"),
    horseId: pick(item, ["horseId"], "N/A"),
    horseWinRateAtBet: item?.horseWinRateAtBet || 0,
    bettorsOnHorseAtBet: item?.bettorsOnHorseAtBet || 0,
    totalBettorsAtBet: item?.totalBettorsAtBet || 0,
    finalOdds: item?.finalOdds || 0,
    pointsWagered: item?.pointsWagered || 0,
    pointsWon: item?.pointsWon || 0,
    result: pick(item, ["result"], "PENDING"),
    placedAt: pick(item, ["placedAt"], ""),
  };
}

function statusColor(status) {
  const normalizedStatus = String(status).toUpperCase();
  if (normalizedStatus === "WIN") return "green";
  if (normalizedStatus === "LOST" || normalizedStatus === "LOSE") return "red";
  return "orange"; // PENDING
}

export default function AdminBetManagement() {
  const [bets, setBets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailData, setDetailData] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(null);

  async function loadBets() {
    setIsLoading(true);
    try {
      const response = await getAllBets();
      setBets(
        resolveList(response).map(normalizeBet).sort(sortNewestRequestFirst),
      );
      setSearchKey("");
    } catch (error) {
      message.error(
        error?.message || "Failed to load system bet requests list",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBets();
  }, []);

  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
      const matchStatus = selectedStatus ? bet.result === selectedStatus : true;
      const matchSearch = searchKey
        ? bet.spectatorId.toLowerCase().includes(searchKey.toLowerCase()) ||
          bet.raceId.toLowerCase().includes(searchKey.toLowerCase()) ||
          bet.horseId.toLowerCase().includes(searchKey.toLowerCase())
        : true;
      return matchStatus && matchSearch;
    });
  }, [bets, selectedStatus, searchKey]);

  function openDetailModal(record) {
    setDetailData(record);
  }

  const columns = useMemo(
    () => [
      {
        title: "Bet ID",
        dataIndex: "id",
        fixed: "left",
        width: 140,
        ellipsis: true,
      },
      {
        title: "Spectator ID",
        dataIndex: "spectatorId",
        width: 150,
        ellipsis: true,
      },
      {
        title: "Race ID",
        dataIndex: "raceId",
        width: 150,
        ellipsis: true,
      },
      {
        title: "Horse ID",
        dataIndex: "horseId",
        width: 150,
        ellipsis: true,
      },
      {
        title: "Wagered",
        dataIndex: "pointsWagered",
        width: 130,
        render: (val) => <Text strong>{val?.toLocaleString("vi-VN")} pts</Text>,
      },
      {
        title: "Odds",
        dataIndex: "finalOdds",
        width: 100,
        render: (val) => <Text>x{val}</Text>,
      },
      {
        title: "Points Won",
        dataIndex: "pointsWon",
        width: 130,
        render: (val, record) => (
          <Text
            strong
            style={{ color: record.result === "WIN" ? "#52c41a" : "inherit" }}
          >
            {val > 0 ? `+${val.toLocaleString("vi-VN")}` : val} pts
          </Text>
        ),
      },
      {
        title: "Result",
        dataIndex: "result",
        width: 130,
        render: (result) => <Tag color={statusColor(result)}>{result}</Tag>,
      },
      {
        title: "Placed At",
        dataIndex: "placedAt",
        width: 180,
        render: formatDate,
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 120,
        render: (_, record) => (
          <Button
            size="small"
            type="primary"
            ghost
            onClick={() => openDetailModal(record)}
          >
            Details
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <section className="bet-management">
      <style>{`
        .bet-management {
          padding: 0;
        }

        .bet-management-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .bet-management-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          width: auto;
        }

        .bet-management-kicker {
          color: #007a68;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .bet-management-header h1.ant-typography {
          margin: 6px 0 0;
          color: #06332e;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          font-weight: 950;
          letter-spacing: 0;
        }

        .bet-management-card {
          border: 1px solid #ccefe7;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 22px 70px rgba(13, 70, 63, 0.08);
          overflow: hidden;
        }

        .bet-management-table.ant-table-wrapper .ant-table-thead > tr > th {
          color: #52726e;
          background: #f3fffc;
          font-weight: 950;
        }

        .bet-management-table.ant-table-wrapper .ant-table-tbody > tr > td {
          color: #0d2321;
          background: #fff;
        }

        .bet-management-refresh.ant-btn {
          border-color: transparent;
          color: #06332e;
          background: #69f8dd;
          font-weight: 900;
        }

        .bet-management-refresh.ant-btn:hover {
          border-color: transparent !important;
          color: #06332e !important;
          background: #75ffe6 !important;
        }

        .bet-management-modal .ant-modal-content {
          border-radius: 8px;
        }

        @media (max-width: 920px) {
          .bet-management-header {
            align-items: flex-start;
            flex-direction: column;
          }
          
          .bet-management-actions {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="bet-management-header">
        <div>
          <div className="bet-management-kicker">Admin dashboard</div>
          <Title level={1}>Bet Management</Title>
        </div>
        <div className="bet-management-actions">
          <Select
            placeholder="Filter by result"
            allowClear
            style={{ width: 180 }}
            onChange={(val) => setSelectedStatus(val)}
          >
            <Select.Option value="PENDING">PENDING</Select.Option>
            <Select.Option value="WIN">WIN</Select.Option>
            <Select.Option value="LOST">LOST</Select.Option>
          </Select>

          <Search
            placeholder="Search by Spectator, Race, Horse ID..."
            allowClear
            enterButton="Search"
            size="middle"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
          />
          <Button
            className="bet-management-refresh"
            onClick={loadBets}
            loading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="bet-management-card">
        <Table
          className="bet-management-table"
          columns={columns}
          dataSource={filteredBets}
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} bets`,
          }}
          scroll={{ x: 1500 }}
        />
      </div>

      {/* MODAL XEM CHI TIẾT CƯỢC */}
      <Modal
        className="bet-management-modal"
        title="System Bet Request Details"
        open={Boolean(detailData)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailData(null)}
          >
            Close
          </Button>,
        ]}
        onCancel={() => setDetailData(null)}
        width={600}
      >
        {detailData && (
          <Descriptions
            column={1}
            bordered
            size="small"
            style={{ marginTop: 15 }}
          >
            <Descriptions.Item label="Bet ID">
              {detailData.id}
            </Descriptions.Item>
            <Descriptions.Item label="Spectator ID">
              {detailData.spectatorId}
            </Descriptions.Item>
            <Descriptions.Item label="Race ID">
              {detailData.raceId}
            </Descriptions.Item>
            <Descriptions.Item label="Horse ID">
              {detailData.horseId}
            </Descriptions.Item>
            <Descriptions.Item label="Horse Win Rate">
              {detailData.horseWinRateAtBet}%
            </Descriptions.Item>
            <Descriptions.Item label="Bettors on Horse">
              {detailData.bettorsOnHorseAtBet} pool(s)
            </Descriptions.Item>
            <Descriptions.Item label="Total Pool Bettors">
              {detailData.totalBettorsAtBet} pool(s)
            </Descriptions.Item>
            <Descriptions.Item label="Final System Odds">
              x{detailData.finalOdds}
            </Descriptions.Item>
            <Descriptions.Item label="Wagered Points">
              {detailData.pointsWagered?.toLocaleString("vi-VN")} pts
            </Descriptions.Item>
            <Descriptions.Item label="Total Return (Won)">
              {detailData.pointsWon?.toLocaleString("vi-VN")} pts
            </Descriptions.Item>
            <Descriptions.Item label="Race Result">
              <Tag color={statusColor(detailData.result)}>
                {detailData.result}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Placed At">
              {formatDate(detailData.placedAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </section>
  );
}
