import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/result-history.css";
import { apiUrl } from "../utils/api";

function ResultHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [band, setBand] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl("/results"));
        const data = await res.json();
        const local = JSON.parse(localStorage.getItem("results") || "[]");
        const pending = JSON.parse(localStorage.getItem("pendingResults") || "[]");
        const merged = [...data, ...local, ...pending].map((r, idx) => ({
          ...r,
          _id: r._id || `local-${idx}-${r.time || Date.now()}`,
          source: r._id ? "server" : "local",
          createdAt: r.createdAt || r.time || new Date().toISOString(),
          percentage: r.percentage || (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0),
        }));
        merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const selectedExam = localStorage.getItem("selectedResultExam");
        const selectedId = localStorage.getItem("selectedResultId");
        const picked =
          (selectedId && merged.find((r) => r._id === selectedId)) ||
          (selectedExam && merged.find((r) => (r.examTitle || "").toLowerCase() === selectedExam.toLowerCase())) ||
          merged[0];
        if (selectedExam) localStorage.removeItem("selectedResultExam");
        setResults(merged);
        if (picked) {
          localStorage.setItem("selectedResultId", picked._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    if (results.length === 0) return { attempts: 0, avg: 0, best: 0, delta: 0 };
    const percentages = results.map((r) => r.percentage || 0);
    const avg = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    const best = Math.max(...percentages);
    const latest = percentages[0] ?? 0;
    const prev = percentages[1] ?? latest;
    const delta = latest - prev;
    return { attempts: results.length, avg, best, delta };
  }, [results]);

  const categories = useMemo(() => {
    const bands = { high: 0, mid: 0, low: 0 };
    results.forEach((r) => {
      const p = r.percentage || 0;
      if (p >= 80) bands.high += 1;
      else if (p >= 50) bands.mid += 1;
      else bands.low += 1;
    });
    return bands;
  }, [results]);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const pct = r.percentage || 0;
      const matchesSearch = (r.examTitle || "Exam").toLowerCase().includes(search.toLowerCase());
      const matchesBand =
        band === "all" ||
        (band === "high" && pct >= 80) ||
        (band === "mid" && pct >= 50 && pct < 80) ||
        (band === "low" && pct < 50);
      return matchesSearch && matchesBand;
    });
  }, [results, search, band]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id, source) => {
    if (source === "server") {
      await fetch(apiUrl(`/results/${id}`), { method: "DELETE" });
    } else {
      const local = JSON.parse(localStorage.getItem("results") || "[]").filter((r, idx) => `local-${idx}-${r.time || ""}` !== id);
      localStorage.setItem("results", JSON.stringify(local));
    }
    setResults((prev) => prev.filter((r) => r._id !== id));
  };

  const handleOpen = (id) => {
    localStorage.setItem("selectedResultId", id);
    navigate("/result");
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <h5>Loading results...</h5>
      </div>
    );
  }

  return (
    <div className="container py-5 result-history-page">
      <div className="header card-surface">
        <div>
          <p className="pill-slim mb-2">Progress tracker</p>
          <h1 className="mb-1">Result history</h1>
          <p className="muted mb-0">See every attempt with quick stats and trends.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline-light">
          <i className="bi bi-arrow-left me-2" />Back to dashboard
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="empty card-surface">
          <div>
            <h4 className="mb-1">No exam history yet</h4>
            <p className="muted mb-0">Take an exam to start tracking your progress.</p>
          </div>
          <Link to="/dashboard" className="btn btn-primary">Browse exams</Link>
        </div>
      ) : (
        <>
          <div className="card-surface mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div className="d-flex gap-2 flex-wrap align-items-center">
              <input
                className="form-control"
                style={{ minWidth: "200px" }}
                placeholder="Search exam title"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <select
                className="form-select"
                value={band}
                onChange={(e) => {
                  setBand(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All scores</option>
                <option value="high">80-100%</option>
                <option value="mid">50-79%</option>
                <option value="low">0-49%</option>
              </select>
            </div>
            <button
              className="btn btn-outline-light"
              onClick={() => {
                const header = ["Exam", "Date", "Score", "Percent", "Source"].join(",");
                const rows = filtered.map((r) =>
                  [r.examTitle || "Exam", new Date(r.createdAt).toLocaleString(), `${r.score}/${r.total}`, r.percentage || 0, r.source || "local"].join(",")
                );
                const csv = [header, ...rows].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "results.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export CSV
            </button>
          </div>

          <div className="stat-grid mb-3">
            <div className="stat-card reveal">
              <p className="muted small mb-1">Attempts</p>
              <h3 className="mb-0">{stats.attempts}</h3>
            </div>
            <div className="stat-card reveal">
              <p className="muted small mb-1">Average</p>
              <h3 className="mb-0">{stats.avg}%</h3>
            </div>
            <div className="stat-card reveal">
              <p className="muted small mb-1">Best</p>
              <h3 className="mb-0">{stats.best}%</h3>
            </div>
            <div className="stat-card reveal">
              <p className="muted small mb-1">Latest vs prev</p>
              <h3 className={`mb-0 ${stats.delta >= 0 ? "text-success" : "text-danger"}`}>
                {stats.delta >= 0 ? "+" : ""}{stats.delta}%
              </h3>
            </div>
          </div>

          <div className="stat-grid mb-3">
            <div className="stat-card reveal">
              <p className="muted small mb-1">80-100%</p>
              <h4 className="mb-0">{categories.high}</h4>
            </div>
            <div className="stat-card reveal">
              <p className="muted small mb-1">50-79%</p>
              <h4 className="mb-0">{categories.mid}</h4>
            </div>
            <div className="stat-card reveal">
              <p className="muted small mb-1">0-49%</p>
              <h4 className="mb-0">{categories.low}</h4>
            </div>
          </div>

          <div className="card-surface mb-3">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Exam</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th>Percent</th>
                    <th>Source</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((res, index) => {
                    const pct = res.percentage || 0;
                    return (
                      <tr key={res._id} style={{ cursor: "pointer" }} onClick={() => handleOpen(res._id)}>
                        <td>{(page - 1) * pageSize + index + 1}</td>
                        <td>{res.examTitle || "Exam"}</td>
                        <td>{new Date(res.createdAt).toLocaleString()}</td>
                        <td>{res.score}/{res.total}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-semibold">{pct}%</span>
                            <div className="mini-bar">
                              <span className="fill" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge-soft">
                            {res.pending ? "Queued" : res.source === "server" ? "Synced" : "Local"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-light"
                              onClick={(e) => {
                                e.stopPropagation();
                                localStorage.setItem("selectedResultId", res._id);
                                window.location.hash = "#/result";
                              }}
                            >
                              View
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(res._id, res.source);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="muted small">Page {page} of {totalPages}</span>
            <div className="btn-group">
              <button className="btn btn-outline-light btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <button className="btn btn-outline-light btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ResultHistory;
