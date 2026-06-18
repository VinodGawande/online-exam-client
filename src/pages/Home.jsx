import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/home.css";
import { getDefaultRouteForRole, getStoredRole, isUserLoggedIn } from "../utils/auth";
import { apiUrl } from "../utils/api";

function Home() {
  const [stats, setStats] = useState({ totalExams: 0 });
  const isLoggedIn = isUserLoggedIn();
  const role = getStoredRole();
  const roleHome = getDefaultRouteForRole(role);

  useEffect(() => {
    fetch(apiUrl("/results"))
      .then((res) => res.json())
      .then((data) => setStats({ totalExams: data.length }))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  const featureList = useMemo(
    () => [
      {
        icon: "bi-shield-check",
        title: "Secure by design",
        copy: "Role-based access, OTP-ready flows, and audit trails keep every assessment clean.",
      },
      {
        icon: "bi-controller",
        title: "Exam crafting",
        copy: "Build MCQ exams with timers, sections, and negative scoring in minutes.",
      },
      {
        icon: "bi-graph-up",
        title: "Instant analytics",
        copy: "Get live performance curves, auto-grading, and downloadable reports.",
      },
      {
        icon: "bi-people",
        title: "Team friendly",
        copy: "Teachers, admins, and invigilators collaborate with clearly scoped controls.",
      },
      {
        icon: "bi-cloud-check",
        title: "Cloud reliability",
        copy: "99.9% uptime targets with daily encrypted backups and versioned exams.",
      },
      {
        icon: "bi-magic",
        title: "Student-first UX",
        copy: "Accessible layouts, distraction-free exam mode, and real-time progress.",
      },
    ],
    []
  );

  const steps = [
    { label: "Register", copy: "Create your account and invite your team." },
    { label: "Design", copy: "Draft sections, upload questions, set the rules." },
    { label: "Publish", copy: "Schedule, notify students, and monitor live." },
    { label: "Review", copy: "View instant scores and export detailed reports." },
  ];

  const testimonials = [
    {
      quote: "We moved our semester exams online in one week. Students loved the clarity.",
      name: "Rudraksha Bhirma",
      title: "Student, B.Tech",
    },
    {
      quote: "The dashboard shows everything I need during a live exam. Zero surprises.",
      name: "Soham Waikar",
      title: "Faculty Lead",
    },
    {
      quote: "Auto-grading plus downloadable analytics saved hours every weekend.",
      name: "Vipin Gavhade",
      title: "Program Coordinator",
    },
  ];

  const statCards = [
    { label: "Exams completed", value: `${stats.totalExams}+`, tone: "primary" },
    { label: "Avg. satisfaction", value: "4.9/5", tone: "success" },
    { label: "Institutions onboarded", value: "32", tone: "warning" },
    { label: "Platform uptime", value: "99.98%", tone: "info" },
  ];

  const chips = [
    { icon: "bi-shield-lock", text: "AI proctoring-ready" },
    { icon: "bi-activity", text: "Real-time insights" },
    { icon: "bi-stars", text: "Modern student UX" },
  ];

  return (
    <div className="home-page">
      <div className="bg-orb bg-orb--one" aria-hidden="true" />
      <div className="bg-orb bg-orb--two" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <section className="hero container">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="pill">2026 release • built for rigorous exams</div>
            <h1>
              Confident exams,
              <span className="accent"> zero chaos.</span>
            </h1>
            <p className="lead">
              A focused MERN platform that keeps students in flow, teachers in control, and admins in the loop
              with instant, verifiable results.
            </p>

            <div className="trust-bar">
              <div className="avatar-stack">
                <span className="mini-avatar">A</span>
                <span className="mini-avatar">S</span>
                <span className="mini-avatar">M</span>
              </div>
              <div>
                <strong>2.3k+</strong> exams run last semester
                <p className="muted small mb-0">Trusted by institutes and bootcamps</p>
              </div>
            </div>

            <div className="chip-row">
              {chips.map((item) => (
                <span className="chip" key={item.text}>
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  {item.text}
                </span>
              ))}
            </div>

            <div className="hero-actions">
              {!isLoggedIn ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg px-4">
                    Get started
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4">
                    Login
                  </Link>
                </>
              ) : (
                <Link to={roleHome} className="btn btn-primary btn-lg px-4">
                  {role === "teacher" ? "Go to teacher panel" : role === "admin" ? "Go to admin panel" : "Go to dashboard"}
                </Link>
              )}
              <p className="muted small mt-3 mb-0">No setup fees. Works on any modern browser.</p>
            </div>
          </div>

            <div className="hero-visual">
              <div className="glass-panel">
                <div className="panel-header">
                  <span className="dot dot--green" />
                  <span className="dot dot--amber" />
                  <span className="dot dot--red" />
                <span className="panel-label">Live exam snapshot</span>
              </div>
              <div className="panel-body">
                <div className="score-card">
                  <div>
                    <p className="muted small mb-1">Current exam</p>
                    <h4 className="mb-0">Data Structures - Unit 3</h4>
                  </div>
                  <div className="score-pill">
                    <i className="bi bi-speedometer2" aria-hidden="true" />
                    42 min left
                  </div>
                </div>

                <div className="progress-grid">
                  <div className="progress-pill">
                    <span className="label">Submissions</span>
                    <span className="value">76%</span>
                    <div className="bar">
                      <span className="fill fill--blue" style={{ width: "76%" }} />
                    </div>
                  </div>
                  <div className="progress-pill">
                    <span className="label">Accuracy</span>
                    <span className="value">92%</span>
                    <div className="bar">
                      <span className="fill fill--mint" style={{ width: "92%" }} />
                    </div>
                  </div>
                </div>

                <div className="mini-stats">
                  <div>
                    <p className="muted small mb-1">Auto-graded</p>
                    <h5 className="mb-0">118 papers</h5>
                  </div>
                  <div>
                    <p className="muted small mb-1">Flagged attempts</p>
                    <h5 className="mb-0 text-warning">3 alerts</h5>
                  </div>
                  <div>
                    <p className="muted small mb-1">Avg. score</p>
                    <h5 className="mb-0">81%</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="ticker card-surface">
          <div className="ticker-item"><i className="bi bi-shield-lock me-2" /> Proctor-ready</div>
          <div className="ticker-item"><i className="bi bi-cloud-download me-2" /> Instant exports</div>
          <div className="ticker-item"><i className="bi bi-people me-2" /> Team roles</div>
          <div className="ticker-item"><i className="bi bi-lightning-charge me-2" /> Auto-scoring</div>
        </div>

        <div className="section-heading">
          <h3>Proof that it works</h3>
          <p className="muted">Real numbers from recent exam runs.</p>
        </div>
        <div className="stat-grid">
          {statCards.map((card) => (
            <div className="stat-card reveal" key={card.label}>
              <div className={`badge-dot badge-dot--${card.tone}`} />
              <p className="muted small mb-1">{card.label}</p>
              <h2 className="mb-0">{card.value}</h2>
            </div>
          ))}
        </div>
      </section>

      <section className="container section" id="features">
        <div className="section-heading with-line">
          <h3>Built for the whole exam lifecycle</h3>
          <p className="muted">Everything you need from creation to analysis, without switching tools.</p>
        </div>
        <div className="feature-grid">
          {featureList.map((feature) => (
            <div className="feature-card reveal" key={feature.title}>
              <div className="icon-wrap">
                <i className={`bi ${feature.icon}`} aria-hidden="true" />
              </div>
              <h5>{feature.title}</h5>
              <p className="muted">{feature.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section strip">
        <div className="container">
          <div className="section-heading with-line">
            <h3>How it flows</h3>
            <p className="muted">A clean four-step journey for students and staff.</p>
          </div>
          <div className="step-grid">
            {steps.map((step, index) => (
              <div className="step-card reveal" key={step.label}>
                <div className="step-number">{index + 1}</div>
                <div>
                  <h6 className="mb-1">{step.label}</h6>
                  <p className="muted mb-0">{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-heading with-line">
          <h3>What people are saying</h3>
          <p className="muted">Feedback from students and educators after live exams.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <div className="testimonial-card reveal" key={item.name}>
              <div className="quote-mark">“</div>
              <p className="mb-3">{item.quote}</p>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar">{item.name.charAt(0)}</div>
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted small mb-0">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <p className="pill pill-light mb-3">Ready when you are</p>
            <h3 className="mb-2">Launch your next exam without the stress.</h3>
            <p className="muted mb-0">
              Spin up an exam, share the link, and watch results roll in—live dashboards included.
            </p>
          </div>
          <div className="cta-actions">
            {!isLoggedIn ? (
              <Link to="/register" className="btn btn-light btn-lg px-4">
                Create my account
              </Link>
            ) : (
              <Link to={role === "student" ? "/dashboard" : roleHome} className="btn btn-light btn-lg px-4">
                {role === "student" ? "Browse exams" : "Open workspace"}
              </Link>
            )}
            {(!isLoggedIn || role === "student") && (
              <Link to="/history" className="btn btn-outline-light btn-lg px-4">
                View past results
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
