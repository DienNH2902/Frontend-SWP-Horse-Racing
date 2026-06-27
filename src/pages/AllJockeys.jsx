import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../api/client";
import { getUsersByRole } from "../api/services/user.service";
import Pagination from "../components/ui/Pagination";
import "./ExploreLists.css";

const PAGE_SIZE = 6;

function imageUrl(value) {
  if (!value) return "/goldenhoof-hero.png";
  if (String(value).startsWith("http")) return value;
  return `${String(API_BASE_URL || "").replace(/\/$/, "")}/${String(value).replace(/^\//, "")}`;
}

function normalizeJockey(jockey, index) {
  const profile = jockey?.jockeyProfile || jockey?.profile || {};
  return {
    id: jockey?._id || jockey?.id || jockey?.userId || index,
    name:
      jockey?.fullName ||
      jockey?.name ||
      profile?.fullName ||
      profile?.name ||
      "Unnamed jockey",
    email: jockey?.email || profile?.email || "—",
    status: jockey?.jockeyStatus || profile?.jockeyStatus || jockey?.status || "Unknown",
    wins: Number(jockey?.totalWin ?? jockey?.wins ?? profile?.totalWin ?? 0),
    winRate: Number(jockey?.winRate ?? profile?.winRate ?? 0),
    image: imageUrl(
      jockey?.avatarUrl ||
        jockey?.avatar ||
        jockey?.imageUrl ||
        profile?.avatarUrl ||
        profile?.avatar,
    ),
  };
}

export default function AllJockeys() {
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    getUsersByRole("Jockey")
      .then((data) => mounted && setJockeys((data || []).map(normalizeJockey)))
      .catch(() => mounted && setJockeys([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const statuses = useMemo(
    () => [...new Set(jockeys.map((jockey) => jockey.status).filter(Boolean))],
    [jockeys],
  );
  const visibleJockeys = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jockeys
      .filter(
        (jockey) =>
          (!query ||
            jockey.name.toLowerCase().includes(query) ||
            jockey.email.toLowerCase().includes(query)) &&
          (status === "all" || jockey.status === status),
      )
      .sort((first, second) => {
        if (sort === "wins-desc") return second.wins - first.wins;
        if (sort === "rate-desc") return second.winRate - first.winRate;
        if (sort === "name-desc") return second.name.localeCompare(first.name);
        return first.name.localeCompare(second.name);
      });
  }, [jockeys, search, sort, status]);
  const paginatedJockeys = visibleJockeys.slice(
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
            <h1>All Jockeys</h1>
            <p>Danh sách jockey và thành tích thi đấu.</p>
          </div>
          <span className="explore-count">{visibleJockeys.length} jockey</span>
        </header>
        <div className="explore-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên hoặc email jockey…"
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
          <div className="explore-state">Đang tải danh sách jockey…</div>
        ) : visibleJockeys.length ? (
          <section className="explore-grid">
            {paginatedJockeys.map((jockey, index) => (
              <article
                className="explore-card explore-card-horizontal"
                key={jockey.id}
              >
                <img
                  className="explore-round-avatar"
                  src={jockey.image}
                  alt={jockey.name}
                />
                <div className="explore-card-body">
                  <span className="explore-eyebrow">
                    JOCKEY #{(page - 1) * PAGE_SIZE + index + 1}
                  </span>
                  <h2>{jockey.name}</h2>
                  <span className="explore-card-subtitle">{jockey.email} · {jockey.status}</span>
                  <div className="explore-card-stats">
                    <div><span>Wins</span><strong>{jockey.wins}</strong></div>
                    <div><span>Win rate</span><strong>{jockey.winRate}%</strong></div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : <div className="explore-state">Không tìm thấy jockey phù hợp.</div>}
        <Pagination
          page={page}
          totalItems={visibleJockeys.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </main>
  );
}
