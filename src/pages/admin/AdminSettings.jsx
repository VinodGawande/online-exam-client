import { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin-panel.css";

const defaultSettings = {
  platformName: "Online Exam",
  logoUrl: "",
  passwordPolicy: "Minimum 8 characters with at least one number",
  notificationEmail: "",
  notificationTitle: "Exam update",
  notificationMessage: "Your exam is now available. Please check the portal.",
};

function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [sentLog, setSentLog] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("adminSystemSettings") || "null");
    const notifications = JSON.parse(localStorage.getItem("adminNotificationLog") || "[]");
    if (stored) setSettings({ ...defaultSettings, ...stored });
    setSentLog(Array.isArray(notifications) ? notifications : []);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem("adminSystemSettings", JSON.stringify(settings));
  };

  const sendNotification = () => {
    const next = [
      {
        id: Date.now(),
        title: settings.notificationTitle,
        message: settings.notificationMessage,
        target: settings.notificationEmail || "All students",
        createdAt: new Date().toISOString(),
      },
      ...sentLog,
    ];
    setSentLog(next);
    localStorage.setItem("adminNotificationLog", JSON.stringify(next));
  };

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="container py-4">
        <div className="admin-header">
          <div>
            <h2>Settings and notifications</h2>
            <p className="mb-0">Manage platform branding, password policy, and send exam or result notifications.</p>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-5">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">System settings</h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Platform name</label>
                  <input className="form-control" name="platformName" value={settings.platformName} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Logo URL</label>
                  <input className="form-control" name="logoUrl" value={settings.logoUrl} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Password policy</label>
                  <textarea className="form-control" rows="4" name="passwordPolicy" value={settings.passwordPolicy} onChange={handleChange} />
                </div>
              </div>
              <div className="admin-actions mt-3">
                <button className="btn btn-primary" onClick={saveSettings}>Save settings</button>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="admin-surface p-3 p-md-4 h-100">
              <h3 className="mb-3">Send notifications</h3>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Target email</label>
                  <input className="form-control" name="notificationEmail" value={settings.notificationEmail} onChange={handleChange} placeholder="Leave blank to notify all students" />
                </div>
                <div className="col-12">
                  <label className="form-label">Notification title</label>
                  <input className="form-control" name="notificationTitle" value={settings.notificationTitle} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows="5" name="notificationMessage" value={settings.notificationMessage} onChange={handleChange} />
                </div>
              </div>
              <div className="admin-actions mt-3">
                <button className="btn btn-outline-light" onClick={sendNotification}>Send in-app notification</button>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-surface p-3 p-md-4 mt-4">
          <h3 className="mb-3">Notification log</h3>
          {!sentLog.length ? (
            <div className="admin-empty">No notifications sent yet.</div>
          ) : (
            <div className="d-grid gap-3">
              {sentLog.map((item) => (
                <div className="admin-panel-card" key={item.id}>
                  <div className="d-flex justify-content-between gap-2 align-items-start">
                    <div>
                      <h4 className="h6 mb-1">{item.title}</h4>
                      <p className="mb-1">{item.message}</p>
                      <small className="admin-muted">Target: {item.target}</small>
                    </div>
                    <span className="admin-tag info">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
