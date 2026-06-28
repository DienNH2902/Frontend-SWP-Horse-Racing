import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getFinishedRaceResults } from "../api/services/home.service";
import Pagination from "../components/ui/Pagination";
import "./ExploreLists.css";

const PAGE_SIZE = 6;

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export default function AllRaceResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [surface, setSurface] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    getFinishedRaceResults()
      .then((data) => mounted && setResults(data || []))
      .catch(() => mounted && setResults([]))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const surfaces = useMemo(
    () => [...new Set(results.map((result) => result.surface).filter(Boolean))],
    [results],
  );
  const visibleResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    return results
      .filter(
        (result) =>
          (!query ||
            result.race.toLowerCase().includes(query) ||
            result.tournament.toLowerCase().includes(query) ||
            result.winner.toLowerCase().includes(query) ||
            result.venue.toLowerCase().includes(query)) &&
          (surface === "all" || result.surface === surface),
      )
      .sort((first, second) => {
        if (sort === "date-asc") {
          return (new Date(first.date).getTime() || 0) - (new Date(second.date).getTime() || 0);
        }
        if (sort === "name-asc") return first.race.localeCompare(second.race);
        if (sort === "name-desc") return second.race.localeCompare(first.race);
        return (new Date(second.date).getTime() || 0) - (new Date(first.date).getTime() || 0);
      });
  }, [results, search, sort, surface]);
  const paginatedResults = visibleResults.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, sort, surface]);

  return (
    <main className="explore-page">
      <div className="explore-shell">
        <Link className="explore-back" to="/home">← Về Home</Link>
        <header className="explore-header">
          <div>
            <span className="explore-eyebrow">GOLDEN HOOF</span>
            <h1>All Race Results</h1>
            <p>Kết quả các race đã hoàn thành.</p>
          </div>
          <span className="explore-count">{visibleResults.length} kết quả</span>
        </header>
        <div className="explore-toolbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm race, tournament, địa điểm hoặc người thắng…"
          />
          <select value={surface} onChange={(event) => setSurface(event.target.value)}>
            <option value="all">Tất cả mặt đường</option>
            {surfaces.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="date-desc">Ngày đua mới nhất</option>
            <option value="date-asc">Ngày đua cũ nhất</option>
            <option value="name-asc">Tên race A → Z</option>
            <option value="name-desc">Tên race Z → A</option>
          </select>
        </div>
        {loading ? (
          <div className="explore-state">Đang tải kết quả race…</div>
        ) : visibleResults.length ? (
          <section className="result-records">
            {paginatedResults.map((result) => (
              <article className="result-record" key={result.id}>
                <img src={result.image} alt="" />
                <div className="result-record-main"><span>Race</span><strong>{result.race}</strong></div>
                <div><span>Ngày đua</span><strong>{formatDate(result.date)}</strong></div>
                <div><span>Winner</span><strong>{result.winner}</strong></div>
                <div><span>Jockey</span><strong>{result.jockey}</strong></div>
                <div><span>Địa điểm</span><strong>{result.venue}</strong></div>
                <div><span>Cự ly</span><strong>{result.distance} · {result.surface}</strong></div>
              </article>
            ))}
          </section>
        ) : <div className="explore-state">Không tìm thấy kết quả phù hợp.</div>}
        <Pagination
          page={page}
          totalItems={visibleResults.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </main>
  );
}
