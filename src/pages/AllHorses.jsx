import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/client";
import { getHorses } from "../api/services/horse.service";
import Pagination from "../components/ui/Pagination";
import "./ExploreLists.css";

const PAGE_SIZE = 6;

function imageUrl(value) {
  if (!value) return "/goldenhoof-hero.png";
  if (String(value).startsWith("http")) return value;
  return `${String(API_BASE_URL || "").replace(/\/$/, "")}/${String(value).replace(/^\//, "")}`;
}

function normalizeHorse(horse, index) {
  return {
    id: horse?._id || horse?.id || horse?.horseId || index,
    name: horse?.name || horse?.horseName || "Unnamed horse",
    breed: horse?.breed || "Horse",
    owner:
      horse?.ownerName ||
      horse?.owner?.fullName ||
      horse?.owner?.name ||
      horse?.stable ||
      "N/A",
    status: horse?.horseStatus || horse?.status || "Unknown",
    wins: Number(horse?.totalWin ?? horse?.wins ?? 0),
    winRate: Number(horse?.winRate ?? 0),
    image: imageUrl(
      horse?.imageUrl || horse?.avatar || horse?.avatarUrl || horse?.photoUrl,
    ),
  };
}

export default function AllHorses() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    getHorses()
      .then((data) => {
        if (mounted) setHorses((data || []).map(normalizeHorse));
      })
      .catch(() => mounted && setHorses([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const statuses = useMemo(
    () => [...new Set(horses.map((horse) => horse.status).filter(Boolean))],
    [horses],
  );
  const visibleHorses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return horses
      .filter(
        (horse) =>
          (!query ||
            horse.name.toLowerCase().includes(query) ||
            horse.owner.toLowerCase().includes(query)) &&
          (status === "all" || horse.status === status),
      )
      .sort((first, second) => {
        if (sort === "wins-desc") return second.wins - first.wins;
        if (sort === "rate-desc") return second.winRate - first.winRate;
        if (sort === "name-desc") return second.name.localeCompare(first.name);
        return first.name.localeCompare(second.name);
      });
  }, [horses, search, sort, status]);
  const paginatedHorses = visibleHorses.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, sort, status]);

  return (
    <main className="explore-page">
      <div className="explore-shell">
        <Link className="explore-back" to="/home">← Về Home</Link>
        <header className="explore-header">
          <div>
            <span className="explore-eyebrow">GOLDEN HOOF</span>
            <h1>All Horses</h1>
            <p>Khám phá toàn bộ ngựa trên hệ thống.</p>
          </div>
          <span className="explore-count">{visibleHorses.length} ngựa</span>
        </header>
        <div className="explore-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên ngựa hoặc chủ sở hữu…"
          />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {statuses.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name-asc">Tên A → Z</option>
            <option value="name-desc">Tên Z → A</option>
            <option value="wins-desc">Nhiều chiến thắng nhất</option>
            <option value="rate-desc">Win rate cao nhất</option>
          </select>
        </div>
        {loading ? (
          <div className="explore-state">Đang tải danh sách ngựa…</div>
        ) : visibleHorses.length ? (
          <section className="explore-grid">
            {paginatedHorses.map((horse) => (
              <article
                className="explore-card explore-card-horizontal"
                key={horse.id}
              >
                <img
                  className="explore-round-avatar"
                  src={horse.image}
                  alt={horse.name}
                />
                <div className="explore-card-body">
                  <h2>{horse.name}</h2>
                  <span className="explore-card-subtitle">{horse.breed} · {horse.status}</span>
                  <div className="explore-card-stats">
                    <div><span>Owner</span><strong>{horse.owner}</strong></div>
                    <div><span>Wins</span><strong>{horse.wins}</strong></div>
                    <div><span>Win rate</span><strong>{horse.winRate}%</strong></div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : <div className="explore-state">Không tìm thấy ngựa phù hợp.</div>}
        <Pagination
          page={page}
          totalItems={visibleHorses.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </main>
  );
}
