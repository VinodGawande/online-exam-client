import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/dashboard.css";
import { apiUrl } from "../utils/api";

function TeacherDashboard() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "teacher") {
      navigate("/login");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("createdExams")) || [];
    setExams(stored);

    const loadResults = () => {
      fetch(apiUrl("/results"))
        .then((res) => res.json())
        .then((data) => setResults(data))
        .catch(() => setResults([]));
    };
    loadResults();
    const id = setInterval(loadResults, 15000);
    return () => clearInterval(id);
  }, [navigate]);

  const metrics = useMemo(() => {
    const totalExams = exams.length;
    const totalQuestions = exams.reduce((sum, exam) => sum + (exam.questions?.length || 0), 0);
    const totalDuration = exams.reduce((sum, exam) => sum + (Number(exam.duration) || 0), 0);
    const published = exams.filter((e) => e.published !== false).length;
    const drafts = totalExams - published;

    return { totalExams, totalQuestions, totalDuration, published, drafts };
  }, [exams]);

  const handleDelete = (id) => {
    const updated = exams.filter((e) => e.id !== id);
    localStorage.setItem("createdExams", JSON.stringify(updated));
    setExams(updated);
  };

  const handleTogglePublish = (id) => {
    const updated = exams.map((e) =>
      e.id === id ? { ...e, published: !e.published } : e
    );
    localStorage.setItem("createdExams", JSON.stringify(updated));
    setExams(updated);
  };

  const handleDuplicate = (id) => {
    const src = exams.find((e) => e.id === id);
    if (!src) return;
    const copy = {
      ...src,
      id: Date.now(),
      title: `${src.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    const updated = [copy, ...exams];
    localStorage.setItem("createdExams", JSON.stringify(updated));
    setExams(updated);
  };

  const filtered = exams
    .filter((e) => (e.title || "").toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const liveExamId = selectedExamId || filtered[0]?.id || null;
  const liveExamTitle = exams.find((e) => e.id === liveExamId)?.title || "";
  const liveAttempts = results
    .filter((r) => (r.examTitle || "").toLowerCase() === liveExamTitle.toLowerCase())
    .sort((a, b) => new Date(b.createdAt || b.time || 0) - new Date(a.createdAt || a.time || 0))
    .slice(0, 6);

  const resultStats = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      const key = (r.examTitle || "").toLowerCase();
      if (!map[key]) map[key] = { count: 0, avg: 0 };
      map[key].count += 1;
      const pct = r.percentage || (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0);
      map[key].avg += pct;
    });
    Object.keys(map).forEach((k) => {
      map[k].avg = Math.round(map[k].avg / map[k].count);
    });
    return map;
  }, [results]);

  return (
    <div className="dash-page">
      <div className="container">
        <div className="dash-hero card-surface">
          <div className="d-flex align-items-start gap-3 flex-wrap">
            <div className="avatar-tile">T</div>
            <div>
              <div className="pill dash-pill">
                <i className="bi bi-person-video3" aria-hidden="true" />
                Teacher control room
              </div>
              <h1 className="mb-2">Plan, publish, and monitor exams</h1>
              <p className="muted mb-0">Craft new assessments, keep drafts organized, and jump to live exam details in one view.</p>
            </div>
          </div>
          <div className="hero-meta">
            <Link to="/teacher/create" className="btn btn-light btn-lg px-4">
              <i className="bi bi-plus-circle me-2" aria-hidden="true" />
              Create exam
            </Link>
          </div>
        </div>

        <div className="stat-grid mb-4">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="icon-soft">
                <i className="bi bi-stack" aria-hidden="true" />
              </div>
              <span className="muted small">Your drafts and published sets</span>
            </div>
            <h3 className="mb-1">{metrics.totalExams}</h3>
            <p className="muted mb-0">Created exams</p>
          </div>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="icon-soft">
                <i className="bi bi-list-ol" aria-hidden="true" />
              </div>
              <span className="muted small">Cumulative across all exams</span>
            </div>
            <h3 className="mb-1">{metrics.totalQuestions}</h3>
            <p className="muted mb-0">Questions prepared</p>
          </div>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="icon-soft">
                <i className="bi bi-clock-history" aria-hidden="true" />
              </div>
              <span className="muted small">Scheduled duration combined</span>
            </div>
            <h3 className="mb-1">{metrics.totalDuration} min</h3>
            <p className="muted mb-0">Total exam time</p>
          </div>
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="icon-soft">
                <i className="bi bi-broadcast-pin" aria-hidden="true" />
              </div>
              <span className="muted small">Publication status</span>
            </div>
            <h3 className="mb-1">{metrics.published} live</h3>
            <p className="muted mb-0">{metrics.drafts} drafts</p>
          </div>
        </div>

        <div className="section-heading with-line mb-3">
          <h3>Your exams</h3>
          <p className="muted mb-0">Search, duplicate, publish, or remove items.</p>
        </div>

        <div className="card-surface mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <input
            className="form-control"
            style={{ maxWidth: "320px" }}
            placeholder="Search exam title"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <span className="muted small">Sorted by latest created</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-card card-surface">
            <div>
              <p className="pill-slim">No exams yet</p>
              <h5 className="mb-1">Start with your first set</h5>
              <p className="muted mb-0">Create a paper with sections, duration, and rich-text questions.</p>
            </div>
            <Link to="/teacher/create" className="btn btn-primary">
              Create exam
            </Link>
          </div>
        ) : (
          <div className="exam-grid teacher-grid">
            {filtered.map((exam) => (
              <div key={exam.id} className="exam-card card-surface">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="pill-slim">{exam.subject || "Subject"}</p>
                    <h5 className="mb-1">{exam.title}</h5>
                    <p className="muted small mb-2">
                      {exam.questions?.length || 0} questions - {exam.duration || "--"} min
                    </p>
                    <p className="muted small mb-0">Created {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : "—"}</p>
                    <p className="muted small mb-0">
                      Attempts: {resultStats[(exam.title || "").toLowerCase()]?.count || 0} | Avg: {resultStats[(exam.title || "").toLowerCase()]?.avg || 0}%
                    </p>
                  </div>
                  <div className="dropdown-dot" title="Manage">
                    <span className={`badge-soft ${exam.published === false ? "bg-warning text-dark" : ""}`}>
                      {exam.published === false ? "Draft" : "Live"}
                    </span>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2 gap-2 flex-wrap">
                  <div className="muted small">Saved locally - edit anytime</div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => handleTogglePublish(exam.id)}>
                      {exam.published === false ? "Publish" : "Unpublish"}
                    </button>
                    <button className="btn btn-outline-light btn-sm" onClick={() => handleDuplicate(exam.id)}>
                      Duplicate
                    </button>
                    <button className="btn btn-outline-light btn-sm" onClick={() => navigate(`/exam-details/${exam.id}`)}>
                      View
                    </button>
                    <button
                      className="btn btn-outline-light btn-sm"
                      onClick={() => {
                        localStorage.setItem("selectedResultExam", exam.title || "");
                        window.location.hash = "#/history";
                      }}
                    >
                      View attempts
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {liveExamId && (
          <div className="card-surface mt-3">
            <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
              <div>
                <p className="pill-slim mb-1">Live snapshot</p>
                <h5 className="mb-0">{liveExamTitle || "Select an exam"} attempts</h5>
              </div>
              <select
                className="form-select"
                style={{ maxWidth: "240px" }}
                value={liveExamId}
                onChange={(e) => setSelectedExamId(Number(e.target.value))}
              >
                {filtered.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                  </option>
                ))}
              </select>
            </div>
            {liveAttempts.length === 0 ? (
              <p className="muted mb-0">No submissions yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Percent</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveAttempts.map((r) => {
                      const pct = r.percentage || (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0);
                      return (
                        <tr key={r._id}>
                          <td>{new Date(r.createdAt || r.time || Date.now()).toLocaleString()}</td>
                          <td>{r.score}/{r.total}</td>
                          <td>{pct}%</td>
                          <td>{r.source === "server" ? "Synced" : r.pending ? "Queued" : "Local"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
