import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/result.css";

function Result() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const serverRes = await fetch("http://localhost:5000/results");
        const data = await serverRes.json();
        const local = JSON.parse(localStorage.getItem("results") || "[]").map((r, idx) => ({
          ...r,
          _id: r._id || `local-${idx}-${r.time || Date.now()}`,
          createdAt: r.createdAt || r.time || new Date().toISOString(),
          percentage: r.percentage || (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0),
          source: "local",
        }));
        const merged = [...data, ...local].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const selectedId = localStorage.getItem("selectedResultId");
        const picked = selectedId ? merged.find((r) => r._id === selectedId) : merged[0];
        setActive(picked || null);
        setList(merged);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <h5>Loading result...</h5>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="container py-5">
        <div className="empty-state card-surface">
          <div>
            <p className="pill-slim">No attempts yet</p>
            <h3 className="mb-2">Take your first exam to see insights here.</h3>
            <p className="muted mb-0">Scores, accuracy, and trends will appear once you submit an exam.</p>
          </div>
          <Link to="/dashboard" className="btn btn-primary btn-lg px-4">
            Browse exams
          </Link>
        </div>
      </div>
    );
  }

  const correct = active.correct ?? active.score ?? 0;
  const total = active.total ?? active.questions?.length ?? 0;
  const incorrect = Math.max(total - correct, 0);
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = percentage >= 40;

  const summary = [
    { label: "Score", value: `${correct}/${total}`, icon: "bi-clipboard-check" },
    { label: "Accuracy", value: `${percentage}%`, icon: "bi-activity" },
    { label: "Incorrect", value: incorrect, icon: "bi-x-circle" },
    { label: "Completed", value: active.time || active.createdAt || "Just now", icon: "bi-clock" },
  ];

  return (
    <div className="container py-5 result-page">
      <div className="result-hero card-surface">
        <div>
          <p className="pill-slim mb-2">{active.examTitle || "Exam"}</p>
          <h1 className="mb-1">{passed ? "Well done" : "Review and retry"}</h1>
          <p className="muted mb-0">See your breakdown, then jump back in to improve your score.</p>
        </div>
        <div className="score-ring" aria-label="Score percentage">
          <div className="ring">
            <div
              className="ring-fill"
              style={{ background: `conic-gradient(#06b6d4 ${percentage}%, rgba(255,255,255,0.08) 0deg)` }}
            />
            <div className="ring-center card-surface">
              <h3 className="mb-0">{percentage}%</h3>
              <p className="muted small mb-0">accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-grid mb-4">
        {summary.map((item) => (
          <div className="stat-card" key={item.label}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="icon-soft">
                <i className={`bi ${item.icon}`} aria-hidden="true" />
              </div>
              <span className="muted small">{item.label}</span>
            </div>
            <h4 className="mb-0">{item.value}</h4>
          </div>
        ))}
      </div>

      <div className="card-surface mb-4">
        <div className="section-heading with-line mb-3">
          <h4>Question breakdown</h4>
          <p className="muted mb-0">Where you gained and lost marks.</p>
        </div>
        <div className="breakdown">
          <div className="break-item">
            <span className="dot dot--green" />
            <div>
              <p className="mb-0">Correct answers</p>
              <p className="muted small mb-0">{correct} questions</p>
            </div>
            <strong>{total > 0 ? Math.round((correct / total) * 100) : 0}%</strong>
          </div>
          <div className="break-item">
            <span className="dot dot--red" />
            <div>
              <p className="mb-0">Incorrect answers</p>
              <p className="muted small mb-0">{incorrect} questions</p>
            </div>
            <strong>{total > 0 ? Math.round((incorrect / total) * 100) : 0}%</strong>
          </div>
        </div>
      </div>

      <div className="action-row card-surface">
        <div>
          <p className="pill-slim mb-2">Next steps</p>
          <h4 className="mb-1">Keep momentum</h4>
          <p className="muted mb-0">Retake the exam or browse your history to spot patterns.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/dashboard" className="btn btn-primary">
            Pick another exam
          </Link>
          <Link to="/history" className="btn btn-outline-light">
            View history
          </Link>
          <Link to="/dashboard" className="btn btn-outline-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>

      <div className="card-surface mt-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Previous attempts</h5>
          <Link to="/history" className="btn btn-sm btn-outline-light">Open full history</Link>
        </div>
        {list.length === 0 ? (
          <p className="muted mb-0">No past attempts yet.</p>
        ) : (
          <div className="list-group">
            {list.slice(0, 5).map((item) => {
              const pct = item.percentage || (item.total > 0 ? Math.round((item.score / item.total) * 100) : 0);
              return (
                <button
                  key={item._id}
                  className={`list-group-item list-group-item-action bg-transparent text-start ${item._id === active?._id ? "active" : ""}`}
                  onClick={() => {
                    localStorage.setItem("selectedResultId", item._id);
                    setActive(item);
                  }}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <strong>{item.examTitle || "Exam"}</strong>
                      <p className="muted small mb-0">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                    <span>{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Result;
