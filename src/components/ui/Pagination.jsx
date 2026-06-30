export default function Pagination({
  page,
  totalItems,
  pageSize = 6,
  onChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems <= pageSize) return null;

  return (
    <nav className="explore-pagination" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        ← Trước
      </button>
      <span>
        Trang <strong>{page}</strong> / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Sau →
      </button>
    </nav>
  );
}
