import { useEffect, useMemo, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin-panel.css";

const defaultSecurity = {
  allowedIps: "",
  tabSwitchAlerts: true,
  fullscreenRequired: true,
  webcamRequired: true,
};

function AdminSecurity() {
  const [results, setResults] = useState([]);
  const [settings, setSettings] = useState(defaultSecurity);

  useEffect(() => {
    fetch("http://localhost:5000/results")
      .then((res) => res.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]));

    const stored = JSON.parse(localStorage.getItem("adminSecuritySettings") || "null");
    if (stored) setSettings({ ...defaultSecurity, ...stored });
  }, []);

  const suspicious = useMemo(() => results.filter((item) => item.note), [results]);

  const saveSettings = () => {
    localStorage.setItem("adminSecuritySettings", JSON.stringify(settings));
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="container py-4">
        <div className="admin-header">
          <div>
            <h2>Security and proctoring</h2>
            <p className="mb-0">Review suspicious attempts, cheating reasons, and system-side exam protection settings.</p>
          </div>
          <div className="admin-chip-row">
            <span className="admin-chip">{suspicious.length} flagged attempts</span>
            <span className="admin-chip">{settings.tabSwitchAlerts ? "Tab alerts on" : "Tab alerts off"}</span>
            <span className="admin-chip">{settings.webcamRequired ? "Webcam required" : "Webcam optional"}</span>
          </div>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-lg-5">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">Security settings</h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Allowed IPs / networks</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={settings.allowedIps}
                    onChange={(e) => setSettings((prev) => ({ ...prev, allowedIps: e.target.value }))}
                    placeholder="192.168.1.0/24&#10;10.0.0.5"
                  />
                </div>
                <div className="col-12 d-grid gap-2">
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" checked={settings.tabSwitchAlerts} onChange={(e) => setSettings((prev) => ({ ...prev, tabSwitchAlerts: e.target.checked }))} />
                    <span className="form-check-label">Generate tab switching alerts</span>
                  </label>
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" checked={settings.fullscreenRequired} onChange={(e) => setSettings((prev) => ({ ...prev, fullscreenRequired: e.target.checked }))} />
                    <span className="form-check-label">Require fullscreen for exams</span>
                  </label>
                  <label className="form-check">
                    <input className="form-check-input" type="checkbox" checked={settings.webcamRequired} onChange={(e) => setSettings((prev) => ({ ...prev, webcamRequired: e.target.checked }))} />
                    <span className="form-check-label">Require webcam / proctoring</span>
                  </label>
                </div>
              </div>
              <div className="admin-actions mt-3">
                <button className="btn btn-primary" onClick={saveSettings}>Save security settings</button>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">Flagged attempts</h3>
              {!suspicious.length ? (
                <div className="admin-empty">No suspicious attempts have been logged yet.</div>
              ) : (
                <div className="d-grid gap-3">
                  {suspicious.map((item) => (
                    <div className="admin-panel-card" key={item._id}>
                      <div className="d-flex justify-content-between gap-2 align-items-start">
                        <div>
                          <h4 className="h6 mb-1">{item.studentName || "Unknown student"}</h4>
                          <p className="mb-1">{item.examTitle || "Exam"} • {item.subject || "General"}</p>
                          <small className="admin-muted">{new Date(item.createdAt || item.time || Date.now()).toLocaleString()}</small>
                        </div>
                        <span className="admin-tag danger">Alert</span>
                      </div>
                      <div className="alert alert-warning mt-3 mb-0">
                        <strong>Reason:</strong> {item.note}
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

export default AdminSecurity;
