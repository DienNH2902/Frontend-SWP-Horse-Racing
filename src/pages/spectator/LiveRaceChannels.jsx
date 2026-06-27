import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getRacesByTournament } from "../../api/services/race.service";
import { getTournaments } from "../../api/services/tournament.service";
import "./LiveRaceChannels.css";

function resolveList(response) {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  for (const key of ["data", "items", "races", "content", "records", "result"]) {
    if (Array.isArray(response[key])) return response[key];
    const nested = resolveList(response[key]);
    if (nested.length) return nested;
  }

  return [];
}

function getId(item) {
  const value = item?._id || item?.id;
  return typeof value === "object" ? value?._id || value?.id : value;
}

function getTournamentName(tournament) {
  return (
    tournament?.title ||
    tournament?.name ||
    tournament?.tournamentName ||
    "GoldenHoof Tournament"
  );
}

function normalizeRace(race, tournament, index) {
  const id = getId(race);
  const horses = Array.isArray(race?.horses)
    ? race.horses
    : Array.isArray(race?.participants)
      ? race.participants
      : [];

  return {
    id,
    name:
      race?.name ||
      race?.title ||
      `Race ${race?.raceOrder || race?.roundNumber || index + 1}`,
    status: race?.status || "Ongoing",
    tournamentName:
      race?.tournamentTitle ||
      race?.tournamentName ||
      getTournamentName(tournament),
    course:
      race?.raceCourseName ||
      race?.courseName ||
      race?.raceCourseId?.name ||
      "Race course",
    startAt:
      race?.startAt ||
      race?.startDateTime ||
      race?.scheduledAt ||
      race?.startTime ||
      race?.date,
    horseCount:
      race?.horseCount ??
      race?.totalHorses ??
      race?.filledSlots ??
      horses.length,
    round: race?.roundNumber,
    order: race?.raceOrder,
  };
}

function isLive(status) {
  return ["ongoing", "live", "in progress", "in_progress"].includes(
    String(status || "").trim().toLowerCase(),
  );
}

function formatStartTime(value) {
  if (!value) return "Đang diễn ra";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function LiveRaceChannels() {
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadLiveRaces = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const tournaments = resolveList(await getTournaments());
      const raceResponses = await Promise.allSettled(
        tournaments.map(async (tournament) => {
          const tournamentId = getId(tournament);
          if (!tournamentId) return [];
          const response = await getRacesByTournament(tournamentId, "Ongoing");
          return resolveList(response).map((race, index) =>
            normalizeRace(race, tournament, index),
          );
        }),
      );

      const loadedRaces = raceResponses
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .filter((race) => race.id && isLive(race.status));

      const uniqueRaces = Array.from(
        new Map(loadedRaces.map((race) => [race.id, race])).values(),
      );

      setRaces(uniqueRaces);
      setLastUpdated(new Date());

      if (
        tournaments.length > 0 &&
        raceResponses.every((result) => result.status === "rejected")
      ) {
        setError("Không thể tải danh sách race từ Backend.");
      }
    } catch (loadError) {
      setRaces([]);
      setError(
        loadError?.message || "Không thể tải danh sách race đang trực tiếp.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveRaces();
  }, [loadLiveRaces]);

  const updateLabel = useMemo(
    () =>
      lastUpdated
        ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}`
        : "Đang đồng bộ với đường đua",
    [lastUpdated],
  );

  return (
    <main className="live-channels-page">
      <div className="live-channels-shell">
        <header className="live-channels-header">
          <div>
            <p className="live-channels-eyebrow">GOLDEN HOOF · LIVE TV</p>
            <h1>Chọn race để theo dõi</h1>
            <p>
              Chọn một kênh đang phát trực tiếp. Hệ thống sẽ tự kết nối và vào
              race cho bạn.
            </p>
          </div>
          <div className="live-channels-actions">
            <span>{updateLabel}</span>
            <button type="button" onClick={loadLiveRaces} disabled={isLoading}>
              {isLoading ? "Đang tải…" : "↻ Làm mới"}
            </button>
          </div>
        </header>

        <section className="live-channel-summary" aria-label="Live summary">
          <div>
            <span className="live-dot" aria-hidden="true" />
            <strong>{races.length}</strong>
            <span>race đang live</span>
          </div>
          <Link to="/profile">Về trang cá nhân</Link>
        </section>

        {error && (
          <section className="live-channel-state error" role="alert">
            <strong>Không tải được danh sách</strong>
            <span>{error}</span>
            <button type="button" onClick={loadLiveRaces}>
              Thử lại
            </button>
          </section>
        )}

        {!error && isLoading && (
          <section className="live-channel-grid" aria-label="Loading races">
            {[1, 2, 3].map((item) => (
              <div className="live-channel-card skeleton" key={item}>
                <div />
                <span />
                <span />
              </div>
            ))}
          </section>
        )}

        {!error && !isLoading && races.length === 0 && (
          <section className="live-channel-state">
            <span className="empty-icon">🏁</span>
            <strong>Chưa có race nào đang live</strong>
            <button type="button" onClick={loadLiveRaces}>
              Kiểm tra lại
            </button>
          </section>
        )}

        {!error && !isLoading && races.length > 0 && (
          <section className="live-channel-grid" aria-label="Live races">
            {races.map((race, index) => (
              <article className="live-channel-card" key={race.id}>
                <div className="channel-preview">
                  <div className="channel-number">
                    CH {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="channel-horses" aria-hidden="true">
                    <span>🏇</span>
                    <span>🏇</span>
                    <span>🏇</span>
                  </div>
                  <span className="channel-live-badge">
                    <i aria-hidden="true" /> LIVE
                  </span>
                </div>

                <div className="channel-content">
                  <p>{race.tournamentName}</p>
                  <h2>{race.name}</h2>
                  <div className="channel-meta">
                    <span>📍 {race.course}</span>
                    <span>🕐 {formatStartTime(race.startAt)}</span>
                    <span>🐎 {race.horseCount || "—"} ngựa</span>
                    {race.round != null && <span>Vòng {race.round}</span>}
                  </div>
                  <Link
                    className="watch-channel-button"
                    to={`/spectator/broadcast/${encodeURIComponent(race.id)}`}
                  >
                    Xem trực tiếp
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
