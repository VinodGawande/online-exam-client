import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin-panel.css";

const formatDate = (value, withTime = false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const getStartOfDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndOfDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [createdExams, setCreatedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    subject: "all",
    exam: "all",
  });

  useEffect(() => {
    const localCreatedExams = JSON.parse(localStorage.getItem("createdExams") || "[]");
    setCreatedExams(Array.isArray(localCreatedExams) ? localCreatedExams : []);

    Promise.all([
      fetch("http://localhost:5000/admin/stats").then((res) => res.json()),
      fetch("http://localhost:5000/results").then((res) => res.json()),
    ])
      .then(([statsData, resultsData]) => {
        setStats(statsData);
        setResults(Array.isArray(resultsData) ? resultsData : []);
      })
      .catch(() => {
        setStats(null);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totals = stats?.totals || {
    users: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    exams: 0,
    results: 0,
    averagePercentage: 0,
  };

  const subjects = useMemo(() => {
    return Array.from(
      new Set(
        createdExams
          .map((item) => item.subject || "General")
          .concat(results.map((item) => item.subject || "General"))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [createdExams, results]);

  const examTitles = useMemo(() => {
    const titles = createdExams
      .filter((item) => filters.subject === "all" || (item.subject || "General") === filters.subject)
      .map((item) => item.title || item.examTitle || "Untitled Exam")
      .concat(
        results
          .filter((item) => filters.subject === "all" || (item.subject || "General") === filters.subject)
          .map((item) => item.examTitle || "Untitled Exam")
      );
    return Array.from(new Set(titles)).sort((a, b) => a.localeCompare(b));
  }, [createdExams, filters.subject, results]);

  const filteredResults = useMemo(() => {
    const from = getStartOfDay(filters.from);
    const to = getEndOfDay(filters.to);

    return results.filter((result) => {
      const attemptDate = new Date(result.createdAt || result.time || Date.now());
      const matchesFrom = !from || attemptDate >= from;
      const matchesTo = !to || attemptDate <= to;
      const matchesSubject = filters.subject === "all" || (result.subject || "General") === filters.subject;
      const matchesExam = filters.exam === "all" || (result.examTitle || "Untitled Exam") === filters.exam;
      return matchesFrom && matchesTo && matchesSubject && matchesExam;
    });
  }, [filters, results]);

  const activeExams = useMemo(() => {
    const now = Date.now();
    return createdExams.filter((exam) => {
      const published = exam.published !== false;
      const start = exam.startDate ? new Date(exam.startDate).getTime() : null;
      const end = exam.endDate ? new Date(exam.endDate).getTime() : null;
      const matchesSubject = filters.subject === "all" || (exam.subject || "General") === filters.subject;
      const matchesExam = filters.exam === "all" || (exam.title || "Untitled Exam") === filters.exam;
      return published && matchesSubject && matchesExam && (!start || start <= now) && (!end || end >= now);
    });
  }, [createdExams, filters.exam, filters.subject]);

  const summary = useMemo(() => {
    const uniqueStudents = new Set();
    const suspicious = filteredResults.filter((item) => item.note).length;
    let totalScore = 0;
    let totalPercentage = 0;

    filteredResults.forEach((result) => {
      uniqueStudents.add(result.userId || result.studentEmail || result._id);
      totalScore += Number(result.score || 0);
      totalPercentage += Number(result.percentage || 0);
    });

    return {
      attempts: filteredResults.length,
      studentsAppeared: uniqueStudents.size,
      averageScore: filteredResults.length ? Number((totalScore / filteredResults.length).toFixed(1)) : 0,
      averagePercentage: filteredResults.length ? Math.round(totalPercentage / filteredResults.length) : 0,
      suspicious,
    };
  }, [filteredResults]);

  const recentActivities = useMemo(() => {
    const userActivities = (stats?.recentUsers || []).map((user) => ({
      id: `user-${user._id}`,
      title: `${user.name} registered`,
      detail: `${user.role || "student"} account created`,
      date: user.createdAt,
      tag: "User",
    }));

    const resultActivities = filteredResults.slice(0, 5).map((result) => ({
      id: `result-${result._id}`,
      title: `${result.studentName || "Student"} submitted ${result.examTitle || "Exam"}`,
      detail: `${result.percentage || 0}% in ${result.subject || "General"}`,
      date: result.createdAt || result.time,
      tag: result.note ? "Alert" : "Result",
    }));

    return userActivities
      .concat(resultActivities)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 8);
  }, [filteredResults, stats?.recentUsers]);

  const quickModules = [
    {
      title: "User Management",
      description: "Add, edit, block, unblock, and bulk import students or teachers.",
      to: "/admin/users",
      chips: ["Student control", "Teacher roles", "Bulk CSV import"],
    },
    {
      title: "Exam Management",
      description: "Schedule exams, set time limits, passing marks, attempt rules, and publish state.",
      to: "/admin/exams",
      chips: ["Publish/Draft", "Time limit", "Attempt rules"],
    },
    {
      title: "Question Bank",
      description: "Maintain questions by subject, topic, difficulty, and upload in bulk.",
      to: "/admin/question-bank",
      chips: ["MCQ / T-F / Fill / Descriptive", "Topic buckets", "Bulk upload"],
    },
    {
      title: "Results & Analytics",
      description: "Check detailed results, ranking, exports, pass ratio, and score trends.",
      to: "/admin/results",
      chips: ["Leaderboard", "CSV export", "Pass / fail"],
    },
    {
      title: "Security & Proctoring",
      description: "Review suspicious attempts, tab switch alerts, and exam protection settings.",
      to: "/admin/security",
      chips: ["Cheating feed", "Tab alerts", "IP policy"],
    },
    {
      title: "Settings & Notifications",
      description: "Manage platform branding, password policy, and student notifications.",
      to: "/admin/settings",
      chips: ["Platform logo", "Notification composer", "Policy settings"],
    },
  ];

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "subject" ? { exam: "all" } : {}),
    }));
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="container py-4">
        <div className="admin-header">
          <div>
            <h2>Admin dashboard</h2>
            <p className="mb-0">Full control center for users, exams, question bank, analytics, security, and system settings.</p>
          </div>
          <div className="admin-chip-row">
            <span className="admin-chip"><i className="bi bi-people" /> {totals.users} total users</span>
            <span className="admin-chip"><i className="bi bi-journal-text" /> {createdExams.length} exam records</span>
            <span className="admin-chip"><i className="bi bi-shield-lock" /> {summary.suspicious} suspicious attempts</span>
          </div>
        </div>

        <div className="admin-surface p-3 p-md-4 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label">From date</label>
              <input type="date" className="form-control" name="from" value={filters.from} onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">To date</label>
              <input type="date" className="form-control" name="to" value={filters.to} onChange={handleFilterChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Subject</label>
              <select className="form-select" name="subject" value={filters.subject} onChange={handleFilterChange}>
                <option value="all">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Exam</label>
              <select className="form-select" name="exam" value={filters.exam} onChange={handleFilterChange}>
                <option value="all">All exams</option>
                {examTitles.map((exam) => (
                  <option key={exam} value={exam}>{exam}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="admin-grid-tiles mb-4">
          <div className="admin-stat-tile"><span>Total users</span><strong>{totals.users}</strong></div>
          <div className="admin-stat-tile"><span>Students + teachers</span><strong>{totals.students + totals.teachers}</strong></div>
          <div className="admin-stat-tile"><span>Total exams</span><strong>{createdExams.length || totals.exams}</strong></div>
          <div className="admin-stat-tile"><span>Active exams</span><strong>{activeExams.length}</strong></div>
          <div className="admin-stat-tile"><span>Attempts in view</span><strong>{summary.attempts}</strong></div>
          <div className="admin-stat-tile"><span>Average score</span><strong>{summary.averageScore}</strong></div>
          <div className="admin-stat-tile"><span>Average percentage</span><strong>{summary.averagePercentage}%</strong></div>
          <div className="admin-stat-tile"><span>Students appeared</span><strong>{summary.studentsAppeared}</strong></div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="admin-surface p-3 p-md-4 h-100">
              <div className="admin-header mb-3">
                <div>
                  <h3>Core admin modules</h3>
                  <p className="mb-0">Everything the admin asked for is now grouped in clear sections.</p>
                </div>
              </div>

              <div className="row g-3">
                {quickModules.map((module) => (
                  <div className="col-md-6" key={module.title}>
                    <div className="admin-panel-card">
                      <h4>{module.title}</h4>
                      <p>{module.description}</p>
                      <div className="admin-chip-row mb-3">
                        {module.chips.map((chip) => (
                          <span className="admin-chip" key={chip}>{chip}</span>
                        ))}
                      </div>
                      <Link to={module.to} className="btn btn-outline-light">Open section</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">Recent activity</h3>
              {loading ? (
                <div className="admin-empty">Loading activity feed...</div>
              ) : !recentActivities.length ? (
                <div className="admin-empty">No recent activity found.</div>
              ) : (
                <div className="d-grid gap-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="admin-panel-card">
                      <div className="d-flex justify-content-between gap-2 align-items-start">
                        <div>
                          <h4 className="h6 mb-1">{activity.title}</h4>
                          <p className="mb-1">{activity.detail}</p>
                          <small className="admin-muted">{formatDate(activity.date, true)}</small>
                        </div>
                        <span className={`admin-tag ${activity.tag === "Alert" ? "danger" : "info"}`}>{activity.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="admin-surface p-3 p-md-4 h-100">
              <div className="admin-header mb-3">
                <div>
                  <h3>Active exams</h3>
                  <p className="mb-0">Currently running or published exams under the selected filters.</p>
                </div>
                <Link to="/admin/exams" className="btn btn-outline-light btn-sm">Manage exams</Link>
              </div>

              {!activeExams.length ? (
                <div className="admin-empty">No active exams in the selected range.</div>
              ) : (
                <div className="d-grid gap-3">
                  {activeExams.slice(0, 6).map((exam) => (
                    <div key={exam.id || exam.title} className="admin-panel-card">
                      <div className="d-flex justify-content-between gap-2 flex-wrap">
                        <div>
                          <h4 className="h6 mb-1">{exam.title || "Untitled Exam"}</h4>
                          <p className="mb-2">{exam.subject || "General"} • {exam.duration || 0} min • Pass {exam.passingMarks || 0}%</p>
                        </div>
                        <span className="admin-tag success">{exam.published === false ? "Draft" : "Live"}</span>
                      </div>
                      <div className="admin-chip-row">
                        <span className="admin-chip">Start: {formatDate(exam.startDate)}</span>
                        <span className="admin-chip">End: {formatDate(exam.endDate)}</span>
                        <span className="admin-chip">Attempts: {exam.attemptLimit || 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="admin-surface p-3 p-md-4 h-100">
              <div className="admin-header mb-3">
                <div>
                  <h3>Recent submissions</h3>
                  <p className="mb-0">Quick view of student performance and flagged activity.</p>
                </div>
                <Link to="/admin/results" className="btn btn-outline-light btn-sm">View all results</Link>
              </div>

              {!filteredResults.length ? (
                <div className="admin-empty">No submissions found for this filter.</div>
              ) : (
                <div className="d-grid gap-3">
                  {filteredResults.slice(0, 6).map((result) => (
                    <div key={result._id} className="admin-panel-card">
                      <div className="d-flex justify-content-between gap-2 align-items-start">
                        <div>
                          <h4 className="h6 mb-1">{result.studentName || "Unknown student"}</h4>
                          <p className="mb-1">{result.examTitle || "Exam"} • {result.subject || "General"}</p>
                          <small className="admin-muted">{formatDate(result.createdAt || result.time, true)}</small>
                        </div>
                        <div className="text-end">
                          <strong>{result.percentage || 0}%</strong>
                          <div>
                            <span className={`admin-tag ${result.note ? "danger" : "success"}`}>
                              {result.note ? "Flagged" : "Clean"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
