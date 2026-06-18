import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/auth.css";
import { loginUser } from "../utils/auth";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // AUTH SUCCESS - Store user data with role
      const user = data.user || data;
      const userRole = user?.role || "student";
      loginUser({ ...user, role: userRole });

      navigate("/");
    } catch (err) {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb--one" aria-hidden="true" />
      <div className="auth-orb auth-orb--two" aria-hidden="true" />
      <div className="auth-bg-grid" aria-hidden="true" />

      <div className="container auth-grid">
        <section className="auth-copy">
          <div className="auth-kicker">
            <i className="bi bi-shield-check" aria-hidden="true" />
            Secure exam access
          </div>
          <h1>
            Welcome back to your
            <span className="accent"> exam workspace.</span>
          </h1>
          <p>
            Sign in to continue your exam journey with the same focused interface students, teachers, and admins use
            across the platform.
          </p>

          <div className="auth-highlights">
            <div className="auth-highlight">
              <strong>Student ready</strong>
              <span>Join exams, review results, and stay in a distraction-free flow.</span>
            </div>
            <div className="auth-highlight">
              <strong>Teacher controls</strong>
              <span>Create papers, publish attempts, and monitor performance in one place.</span>
            </div>
          </div>

          <div className="auth-stats">
            <span className="auth-stat-pill">
              <i className="bi bi-camera-video" aria-hidden="true" />
              AI proctoring
            </span>
            <span className="auth-stat-pill">
              <i className="bi bi-bar-chart" aria-hidden="true" />
              Instant results
            </span>
            <span className="auth-stat-pill">
              <i className="bi bi-people" aria-hidden="true" />
              Role-based access
            </span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-body">
            <div className="auth-icon">
              <i className="bi bi-person-circle" aria-hidden="true" />
            </div>
            <h2>Sign In</h2>
            <p className="auth-subtitle">
              Student, teacher, and admin sabhi login ke baad home par land karte hain, jahan se apna workspace open kar sakte hain.
            </p>

            <div className="auth-form">
              <div className="auth-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="auth-alert error">{error}</div>}

              <button className="auth-submit" onClick={handleLogin} disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <p className="auth-footer-note">Sign in ke baad pehle home khulega, phir aap apne role ke hisaab se kisi bhi section me ja sakte hain.</p>
            </div>

            <p className="auth-switch">
              New here? <Link to="/register">Create Account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
