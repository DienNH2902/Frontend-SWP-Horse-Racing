import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined, HistoryOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { createBet } from "../../api/services/bet.service";
import { getHorses } from "../../api/services/horse.service";
import {
  getRaceById,
  getRacesByTournament,
} from "../../api/services/race.service";
import { getTournaments } from "../../api/services/tournament.service";

function getId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;

  return item._id || item.id || item.horseId || item.raceId || "";
}

function getRaceName(race, index) {
  return (
    race?.name ||
    race?.title ||
    `Race ${race?.raceOrder || race?.roundNumber || index + 1}`
  );
}

function getHorseName(horse) {
  return horse?.name || horse?.horseName || "";
}

function isBettableRace(race) {
  const status = String(race?.status || "")
    .trim()
    .toLowerCase();

  return status === "scheduled";
}

function extractRaceHorses(race) {
  if (Array.isArray(race?.horses)) return race.horses;
  if (Array.isArray(race?.participants)) return race.participants;

  return [];
}

function getHorseReference(participant) {
  return (
    participant?.horse ||
    participant?.horseInfo ||
    participant?.horseId ||
    participant
  );
}

export default function SpectatorBetting() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const selectedRaceId = Form.useWatch("raceId", form);
  const [messageApi, contextHolder] = message.useMessage();
  const [races, setRaces] = useState([]);
  const [horsesById, setHorsesById] = useState(new Map());
  const [horseOptions, setHorseOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHorses, setIsLoadingHorses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadBettingData() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [tournaments, horses] = await Promise.all([
          getTournaments(),
          getHorses(),
        ]);
        const horseMap = new Map(
          (horses || [])
            .map((horse) => [String(getId(horse)), getHorseName(horse)])
            .filter(([id]) => id),
        );
        const raceResponses = await Promise.allSettled(
          (tournaments || []).map(async (tournament) => {
            const tournamentId = getId(tournament);
            if (!tournamentId) return [];

            const tournamentRaces = await getRacesByTournament(tournamentId);
            return (tournamentRaces || []).map((race, index) => ({
              ...race,
              id: getId(race),
              name: getRaceName(race, index),
              tournamentName:
                race?.tournamentTitle ||
                race?.tournamentName ||
                tournament?.title ||
                tournament?.name ||
                "Tournament",
            }));
          }),
        );
        const loadedRaces = raceResponses
          .flatMap((result) =>
            result.status === "fulfilled" ? result.value : [],
          )
          .filter((race) => race.id && isBettableRace(race));
        const uniqueRaces = Array.from(
          new Map(loadedRaces.map((race) => [race.id, race])).values(),
        );

        if (isMounted) {
          setHorsesById(horseMap);
          setRaces(uniqueRaces);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error?.message || "Unable to load races for betting.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBettingData();

    return () => {
      isMounted = false;
    };
  }, []);

  const raceOptions = useMemo(
    () =>
      races.map((race) => ({
        value: race.id,
        label: `${race.name} — ${race.tournamentName}`,
      })),
    [races],
  );

  async function handleRaceChange(raceId) {
    form.setFieldValue("horseId", undefined);
    setHorseOptions([]);
    setIsLoadingHorses(true);

    try {
      const race =
        (await getRaceById(raceId)) ||
        races.find((item) => item.id === raceId) ||
        {};
      const options = extractRaceHorses(race)
        .map((participant) => {
          const reference = getHorseReference(participant);
          const horseId =
            getId(reference) ||
            getId(participant?.horseId) ||
            getId(participant);
          const label =
            participant?.horseName ||
            getHorseName(reference) ||
            horsesById.get(String(horseId)) ||
            "";

          return horseId && label ? { value: String(horseId), label } : null;
        })
        .filter(Boolean);

      setHorseOptions(
        Array.from(
          new Map(options.map((option) => [option.value, option])).values(),
        ),
      );
    } catch (error) {
      messageApi.error(
        error?.message || "Unable to load horses for this race.",
      );
    } finally {
      setIsLoadingHorses(false);
    }
  }

  async function handleSubmit(values) {
    setIsSubmitting(true);

    try {
      await createBet({
        raceId: values.raceId,
        horseId: values.horseId,
        pointsWagered: values.pointsWagered,
      });
      messageApi.success("Bet placed successfully");
      form.resetFields();
      setHorseOptions([]);
    } catch (error) {
      messageApi.error(error?.message || "Unable to place bet.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background:
          "radial-gradient(circle at top left, #e2fff8, transparent 34%), #f4fbf9",
      }}
    >
      {contextHolder}
      <style>{`
        .betting-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .betting-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #06332e;
          font-size: 20px;
          font-weight: 950;
          text-decoration: none;
        }

        .betting-brand img {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .betting-home-btn.ant-btn {
          min-height: 40px;
          border: 1px solid rgba(8, 122, 109, 0.3);
          border-radius: 8px;
          color: #06332e;
          background: #69f8dd;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 8px 20px rgba(8, 122, 109, 0.12);
        }

        .betting-home-btn.ant-btn:hover {
          border-color: #087a6d !important;
          color: #06332e !important;
          background: #75ffe6 !important;
          transform: translateY(-1px);
        }
      `}</style>
      <div style={{ width: "min(680px, 100%)", margin: "0 auto" }}>
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <div className="betting-topbar">
            <Link className="betting-brand" to="/home">
              <img src="/goldenhoof-logo.png" alt="" />
              <span>GoldenHoof</span>
            </Link>
            <Space size={10}>
              <Button
                className="betting-history-btn"
                icon={<HistoryOutlined />}
                onClick={() => navigate("/spectator/bet-history")}
              >
                History
              </Button>
              <Button
                className="betting-home-btn"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/home")}
              >
                Back to Home
              </Button>
            </Space>
          </div>

          <div>
            <Typography.Text style={{ color: "#087a6d", fontWeight: 900 }}>
              GOLDENHOOF POINT BETTING
            </Typography.Text>
            <Typography.Title level={1} style={{ margin: "4px 0 0" }}>
              Place Your Bet
            </Typography.Title>
          </div>

          {errorMessage ? (
            <Alert type="error" showIcon message={errorMessage} />
          ) : null}

          <Card
            style={{
              border: "1px solid #ccefe7",
              borderRadius: 14,
              boxShadow: "0 20px 60px rgba(13, 70, 63, 0.1)",
            }}
          >
            {isLoading ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <Spin size="large" />
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
              >
                <Form.Item
                  label="Race"
                  name="raceId"
                  rules={[{ required: true, message: "Please select a race" }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={raceOptions}
                    placeholder="Select race by name"
                    onChange={handleRaceChange}
                    notFoundContent="No races available for betting"
                  />
                </Form.Item>

                <Form.Item
                  label="Horse"
                  name="horseId"
                  rules={[{ required: true, message: "Please select a horse" }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={horseOptions}
                    loading={isLoadingHorses}
                    disabled={!selectedRaceId}
                    placeholder={
                      selectedRaceId
                        ? "Select horse by name"
                        : "Select a race first"
                    }
                    notFoundContent={
                      isLoadingHorses
                        ? "Loading horses..."
                        : "No horses assigned to this race"
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Points Wagered"
                  name="pointsWagered"
                  rules={[
                    { required: true, message: "Please enter your wager" },
                    {
                      type: "number",
                      min: 50,
                      message: "Wager must be at least 50 points",
                    },
                  ]}
                >
                  <InputNumber
                    min={50}
                    precision={0}
                    addonAfter="points"
                    placeholder="Minimum 50"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <div style={{ margin: "-8px 0 20px" }}>
                  <Typography.Text
                    type="secondary"
                    style={{ display: "block", marginBottom: 9 }}
                  >
                    Recommended wager
                  </Typography.Text>
                  <Space wrap>
                    {[50, 100, 200, 500, 1000].map((points) => (
                      <Button
                        key={points}
                        onClick={() =>
                          form.setFieldValue("pointsWagered", points)
                        }
                      >
                        {points.toLocaleString("vi-VN")}
                      </Button>
                    ))}
                  </Space>
                </div>

                <Button
                  block
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  style={{
                    height: 48,
                    borderColor: "#087a6d",
                    background: "#087a6d",
                    fontWeight: 900,
                  }}
                >
                  Place Bet
                </Button>
              </Form>
            )}
          </Card>
        </Space>
      </div>
    </main>
  );
}
