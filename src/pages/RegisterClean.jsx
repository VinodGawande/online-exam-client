import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/auth.css";
import { apiUrl } from "../utils/api";

function RegisterClean() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
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
            <i className="bi bi-layers" aria-hidden="true" />
            One platform, three roles
          </div>
          <h1>
            Create an account that fits
            <span className="accent"> your exam role.</span>
          </h1>
          <p>
            Join as a student or teacher with the same polished flow used across the platform. Admin accounts stay
            protected and are managed separately.
          </p>

          <div className="auth-highlights">
            <div className="auth-highlight">
              <strong>For students</strong>
              <span>Access published exams, follow secure instructions, and review your result history.</span>
            </div>
            <div className="auth-highlight">
              <strong>For teachers</strong>
              <span>Design papers, publish them cleanly, and manage attempts from one workspace.</span>
            </div>
          </div>

          <div className="auth-stats">
            <span className="auth-stat-pill">
              <i className="bi bi-pencil-square" aria-hidden="true" />
              Fast exam creation
            </span>
            <span className="auth-stat-pill">
              <i className="bi bi-shield-lock" aria-hidden="true" />
              Protected admin area
            </span>
            <span className="auth-stat-pill">
              <i className="bi bi-clock-history" aria-hidden="true" />
              Timed exam workflows
            </span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-body">
            {!success ? (
              <>
                <div className="auth-icon">
                  <i className="bi bi-person-plus" aria-hidden="true" />
                </div>
                <h2>Create Account</h2>
                <p className="auth-subtitle">
                  Pick your role, fill in your details, and get into the platform with the same visual flow as the rest
                  of the site.
                </p>

                <div className="auth-form">
                  <div className="auth-field">
                    <label htmlFor="register-name">Full Name</label>
                    <input
                      id="register-name"
                      placeholder="Enter your full name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="auth-field">
                    <label>Choose Role</label>
                    <div className="auth-role-grid">
                      <label className={`auth-role-card ${form.role === "student" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          checked={form.role === "student"}
                          onChange={handleChange}
                        />
                        <div>
                          <strong>Student</strong>
                          <span>Attempt exams, track scores, and view result history.</span>
                        </div>
                      </label>
                      <label className={`auth-role-card ${form.role === "teacher" ? "active" : ""}`}>
                        <input
                          type="radio"
                          name="role"
                          value="teacher"
                          checked={form.role === "teacher"}
                          onChange={handleChange}
                        />
                        <div>
                          <strong>Teacher</strong>
                          <span>Create exams, publish papers, and monitor submissions.</span>
                        </div>
                      </label>
                    </div>
                    <p className="auth-helper">Admin accounts are created and managed separately by the platform owner.</p>
                  </div>

                  <div className="auth-field">
                    <label htmlFor="register-email">Email</label>
                    <input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="register-password">Password</label>
                    <input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="register-confirm-password">Confirm Password</label>
                    <input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>

                  {error && <div className="auth-alert error">{error}</div>}

                  <button className="auth-submit" onClick={handleRegister} disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>

                <p className="auth-switch">
                  Already have an account? <Link to="/login">Sign In</Link>
                </p>
              </>
            ) : (
              <div className="auth-success-wrap">
                <div className="auth-success-icon">
                  <i className="bi bi-check-circle" aria-hidden="true" />
                </div>
                <h2>Registration Successful</h2>
                <p className="auth-subtitle">Your account is ready. Redirecting you to login so you can continue.</p>
                <div className="auth-alert success">Account created successfully.</div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default RegisterClean;
