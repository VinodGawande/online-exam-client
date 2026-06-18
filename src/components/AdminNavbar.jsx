import { Link, useLocation } from "react-router-dom";
import "../styles/admin-panel.css";

function AdminNavbar() {
  const location = useLocation();
  const links = [
    { to: "/admin", label: "Overview" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/exams", label: "Exams" },
    { to: "/admin/question-bank", label: "Question Bank" },
    { to: "/admin/results", label: "Results" },
    { to: "/admin/security", label: "Security" },
    { to: "/admin/settings", label: "Settings" },
  ];

  return (
    <div className="admin-nav-shell">
      <div>
        <h4 className="admin-nav-title">Admin Control Center</h4>
        <p className="admin-nav-subtitle">Manage users, exams, analytics, security, and system settings.</p>
      </div>
      <div className="admin-nav-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`admin-nav-link ${location.pathname === link.to ? "is-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminNavbar;
