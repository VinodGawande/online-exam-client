import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/dashboard.css";
import exams from "../data/exams";
import MembershipStatus from "../components/MembershipStatus";
import UpgradeModal from "../components/UpgradeModal";

function Dashboard() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [createdExams, setCreatedExams] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userRole = user?.role || "student";

    setRole(userRole);
    setUserName(user?.name || "User");
    const stored = JSON.parse(localStorage.getItem("createdExams")) || [];
    setCreatedExams(stored);

    if (userRole === "teacher") {
      navigate("/teacher");
      return;
    }

    fetch("http://127.0.0.1:5000/results")
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const derived = useMemo(() => {
    const totalExams = results.length;
    const scores = results.map((r) => r.percentage || (r.total > 0 ? (r.score / r.total) * 100 : 0));
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const averageScore = scores.length ? Math.round(scores.reduce((sum, v) => sum + v, 0) / scores.length) : 0;
    const totalQuestions = results.reduce((sum, r) => sum + (r.total || 0), 0);

    return { totalExams, bestScore, averageScore, totalQuestions };
  }, [results]);

  const recentResults = results.slice(0, 4);

  const statCards = [
    { label: "Exams taken", value: derived.totalExams, icon: "bi-clipboard-check", detail: "Completed on this account" },
    { label: "Average score", value: `${derived.averageScore}%`, icon: "bi-activity", detail: "Across every attempt" },
    { label: "Best score", value: `${derived.bestScore}%`, icon: "bi-trophy", detail: "Personal record" },
    { label: "Questions answered", value: derived.totalQuestions, icon: "bi-journal-check", detail: "Total responses" },
  ];

  const roleChip =
    role === "student"
      ? { text: "Student", icon: "bi-mortarboard" }
      : { text: "Teacher", icon: "bi-person-check" };

  const combinedExams = useMemo(() => {
    return [...createdExams.filter((exam) => exam.published !== false), ...exams].map((exam) => ({
      ...exam,
      totalQuestions: exam.totalQuestions || exam.questions?.length || 0,
      difficulty: exam.difficulty || "Medium",
      description: exam.description || "Teacher-created exam",
    }));
  }, [createdExams]);

  return (
    <div className="dash-page">
      <div className="container">
        <div className="dash-hero card-surface">
          <div className="d-flex align-items-start gap-3 flex-wrap">
            <div className="avatar-tile">{userName.charAt(0).toUpperCase()}</div>
            <div>
              <div className="pill dash-pill">
                <i className={`bi ${roleChip.icon}`} aria-hidden="true" />
                {roleChip.text} mode
              </div>
              <h1 className="mb-2">Welcome back, {userName}</h1>
              <p className="muted mb-0">Track progress, revisit attempts, and launch new exams without leaving this page.</p>
            </div>
          </div>
          <div className="hero-meta">
            <div>
              <p className="muted small mb-1">Next action</p>
              <strong>Pick an exam and stay in flow.</strong>
            </div>
            <div className="hero-dots">
              <span className="dot dot--green" />
              <span className="dot dot--amber" />
              <span className="dot dot--red" />
            </div>
            <Link to="/history" className="btn btn-outline-light btn-sm ms-3">
              View all results
            </Link>
          </div>
        </div>

        <div className="stat-grid mb-4">
          {statCards.map((card) => (
            <div className="stat-card reveal" key={card.label}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="icon-soft">
                  <i className={`bi ${card.icon}`} aria-hidden="true" />
                </div>
                <span className="muted small">{card.detail}</span>
              </div>
              <h3 className="mb-1">{card.value}</h3>
              <p className="muted mb-0">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="membership-strip mb-4">
          <div className="section-heading with-line mb-3">
            <h3>Membership and exam limits</h3>
            <p className="muted mb-0">Free plan users can take limited exams every month. Upgrade for more attempts.</p>
          </div>
          <MembershipStatus />
          <div className="membership-cta-row mt-3">
            <button className="btn btn-primary" onClick={() => setShowUpgradeModal(true)}>
              <i className="bi bi-stars me-2" />
              Upgrade Membership
            </button>
            <Link to="/membership" className="btn btn-outline-light">
              View all plans
            </Link>
          </div>
        </div>

        <div className="section-heading with-line mb-3">
          <h3>Available exams</h3>
          <p className="muted mb-0">Published exams only, ready for students to attempt anytime.</p>
        </div>
        <div className="exam-grid">
          {combinedExams.map((exam) => (
            <div key={exam.id} className="exam-card card-surface reveal">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="pill-slim">{exam.subject}</p>
                  <h5 className="mb-1">{exam.title}</h5>
                  <p className="muted small mb-2">{exam.description}</p>
                </div>
                <span className="badge-soft">{exam.difficulty}</span>
              </div>

              <div className="exam-meta">
                <span>
                  <i className="bi bi-clock me-1" aria-hidden="true" />
                  {exam.duration} min
                </span>
                <span>
                  <i className="bi bi-list-check me-1" aria-hidden="true" />
                  {exam.totalQuestions} questions
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="muted small">Includes smart timer and auto grading</div>
                <Link to={`/exam-details/${exam.id}`} className="btn btn-primary btn-sm px-3">
                  Start exam
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="section-heading with-line mt-5 mb-3">
          <h3>Recent results</h3>
          <p className="muted mb-0">Your latest attempts with quick stats.</p>
        </div>
        <div className="result-panel card-surface">
          {loading ? (
            <div className="muted">Loading latest scores...</div>
          ) : recentResults.length === 0 ? (
            <div className="muted">No attempts yet. Start an exam to see results here.</div>
          ) : (
            recentResults.map((r) => {
              const percent = r.percentage ? Math.round(r.percentage) : r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
              return (
                <div className="result-row" key={r._id}>
                  <div>
                    <h6 className="mb-1">{r.examTitle || "Exam"}</h6>
                    <p className="muted small mb-0">
                      {r.score}/{r.total} score - {percent}%
                    </p>
                  </div>
                  <span className="badge-soft">{percent}%</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <UpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={() => window.location.reload()}
      />
    </div>
  );
}

export default Dashboard;
        
