import { Link, useLocation, useNavigate } from "react-router-dom";
import { getDefaultRouteForRole, getStoredRole, getStoredUser, isUserLoggedIn, logoutUser } from "../utils/auth";
import "../styles/navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isUserLoggedIn();
  const role = getStoredRole();
  const user = getStoredUser();
  const isExamMode = location.pathname === "/exam";
  const profileInitial = (user?.name || role || "U").charAt(0).toUpperCase();
  const isProfilePage = location.pathname === "/profile";
  const workspaceRoute = role === "admin" ? "/admin" : getDefaultRouteForRole(role);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  if (isExamMode) return null;

  return (
    <header className="topbar-shell">
      <div className="topbar-brand">
        <Link to="/" className="topbar-logo">
          <span className="topbar-logo-mark">OX</span>
          <span>
            <strong>Online Exam</strong>
            <small>Secure assessment workspace</small>
          </span>
        </Link>
        {isLoggedIn && <div className="topbar-subtext">{user?.name || role} • {role}</div>}
      </div>

      <nav className="topbar-links" aria-label="Main navigation">
        <Link to="/" className="topbar-link">Home</Link>

        {!isLoggedIn && (
          <>
            <Link to="/login" className="topbar-link">Login</Link>
            <Link to="/register" className="topbar-link topbar-link--accent">Register</Link>
          </>
        )}

        {isLoggedIn && (
          <>
            <Link to={workspaceRoute} className="topbar-link topbar-link--workspace">
              {role === "teacher" ? "Teacher Panel" : role === "admin" ? "Admin Panel" : "Dashboard"}
            </Link>
            {role === "student" && <Link to="/history" className="topbar-link">Results</Link>}
            {role === "teacher" && <Link to="/teacher/create" className="topbar-link">Create Exam</Link>}
            <button onClick={handleLogout} className="topbar-logout">
              Logout
            </button>
            <Link
              to="/profile"
              className={`topbar-profile ${isProfilePage ? "topbar-profile--active" : ""}`}
              aria-label="Open profile"
              title={user?.name || "Profile"}
            >
              <span className="topbar-profile-badge">{profileInitial}</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
