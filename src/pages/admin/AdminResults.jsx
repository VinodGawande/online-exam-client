import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin-panel.css";

const toCsv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(","));
  return [headers.join(","), ...body].join("\n");
};

function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/results")
      .then((res) => res.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results.filter((item) =>
      (item.examTitle || "").toLowerCase().includes(q) ||
      (item.subject || "").toLowerCase().includes(q) ||
      (item.studentName || "").toLowerCase().includes(q) ||
      (item.studentEmail || "").toLowerCase().includes(q)
    );
  }, [results, search]);

  const analytics = useMemo(() => {
    const passCount = filtered.filter((item) => Number(item.percentage || 0) >= 40).length;
    const failCount = filtered.length - passCount;
    const average = filtered.length
      ? Math.round(filtered.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / filtered.length)
      : 0;

    const studentMap = new Map();
    filtered.forEach((item) => {
      const key = item.studentEmail || item.userId || item._id;
      const existing = studentMap.get(key) || {
        name: item.studentName || "Unknown student",
        email: item.studentEmail || "No email",
        attempts: 0,
        averagePercentage: 0,
        bestPercentage: 0,
      };
      existing.attempts += 1;
      existing.averagePercentage += Number(item.percentage || 0);
      existing.bestPercentage = Math.max(existing.bestPercentage, Number(item.percentage || 0));
      studentMap.set(key, existing);
    });

    const leaderboard = Array.from(studentMap.values())
      .map((entry) => ({
        ...entry,
        averagePercentage: entry.attempts ? Math.round(entry.averagePercentage / entry.attempts) : 0,
      }))
      .sort((a, b) => b.bestPercentage - a.bestPercentage || b.averagePercentage - a.averagePercentage)
      .slice(0, 10);

    return { passCount, failCount, average, leaderboard };
  }, [filtered]);

  const exportResults = () => {
    const rows = filtered.map((item) => ({
      exam: item.examTitle || "Exam",
      subject: item.subject || "General",
      student_name: item.studentName || "Unknown student",
      student_email: item.studentEmail || "",
      score: `${item.score || 0}/${item.total || 0}`,
      percentage: `${item.percentage || 0}%`,
      submitted_at: new Date(item.createdAt || item.time || Date.now()).toLocaleString(),
      note: item.note || "",
    }));

    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-results-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="container py-4">
        <div className="admin-header">
          <div>
            <h2>Results and analytics</h2>
            <p className="mb-0">Detailed performance view, leaderboard, export reports, and pass/fail reporting.</p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-outline-light" onClick={exportResults}>Export CSV report</button>
          </div>
        </div>

        <div className="admin-grid-tiles mb-4">
          <div className="admin-stat-tile"><span>Total attempts</span><strong>{filtered.length}</strong></div>
          <div className="admin-stat-tile"><span>Pass count</span><strong>{analytics.passCount}</strong></div>
          <div className="admin-stat-tile"><span>Fail count</span><strong>{analytics.failCount}</strong></div>
          <div className="admin-stat-tile"><span>Average %</span><strong>{analytics.average}%</strong></div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-lg-4">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">Leaderboard</h3>
              {!analytics.leaderboard.length ? (
                <div className="admin-empty">No leaderboard data yet.</div>
              ) : (
                <div className="d-grid gap-3">
                  {analytics.leaderboard.map((item, index) => (
                    <div className="admin-panel-card" key={`${item.email}-${index}`}>
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <h4 className="h6 mb-1">#{index + 1} {item.name}</h4>
                          <p className="mb-1">{item.email}</p>
                          <small className="admin-muted">{item.attempts} attempts</small>
                        </div>
                        <span className="admin-tag success">{item.bestPercentage}% best</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            <div className="admin-surface p-3 p-md-4 h-100">
              <div className="admin-header">
                <div>
                  <h3>Result table</h3>
                  <p className="mb-0">Search by exam, subject, student name, or email.</p>
                </div>
                <div style={{ minWidth: "280px" }}>
                  <input
                    className="form-control"
                    placeholder="Search results"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="admin-empty">Loading results...</div>
              ) : !filtered.length ? (
                <div className="admin-empty">No results found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Subject</th>
                        <th>Student</th>
                        <th>Score</th>
                        <th>Percent</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((result) => (
                        <tr key={result._id}>
                          <td>{result.examTitle || "Exam"}</td>
                          <td>{result.subject || "General"}</td>
                          <td>
                            <div>{result.studentName || "Unknown student"}</div>
                            <small className="text-muted">{result.studentEmail || "No email"}</small>
                          </td>
                          <td>{result.score}/{result.total}</td>
                          <td>{result.percentage || 0}%</td>
                          <td>
                            <span className={`admin-tag ${result.note ? "danger" : Number(result.percentage || 0) >= 40 ? "success" : "warning"}`}>
                              {result.note ? "Flagged" : Number(result.percentage || 0) >= 40 ? "Pass" : "Fail"}
                            </span>
                          </td>
                          <td>{new Date(result.createdAt || result.time || Date.now()).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminResults;
