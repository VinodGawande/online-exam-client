import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/profile.css";
import { getStoredRole, getStoredUser } from "../utils/auth";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
};

const roleCopy = {
  student: "Attempt exams, review results, and keep your academic workflow organized from one focused workspace.",
  teacher: "Create assessments, monitor attempts, and manage your teaching operations from a unified control surface.",
  admin: "Control users, analytics, exams, and platform visibility from a high-trust command workspace.",
};

function Profile() {
  const storedUser = getStoredUser();
  const role = getStoredRole();
  const [profile, setProfile] = useState(storedUser);
  const [loading, setLoading] = useState(Boolean(storedUser?._id));
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!storedUser?._id) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/users/${storedUser._id}`)
      .then((res) => res.json())
      .then((data) => setProfile(data?._id ? data : storedUser))
      .catch(() => setProfile(storedUser))
      .finally(() => setLoading(false));
  }, [storedUser]);

  const membership = profile?.membership || {};
  const preferences = profile?.preferences || {};
  const usage = profile?.usage || {};
  const resolvedRole = profile?.role || role || "student";

  const stats = useMemo(() => {
    return [
      {
        label: "Role",
        value: resolvedRole.toUpperCase(),
        caption: "Primary access layer",
        icon: "bi-person-badge",
      },
      {
        label: "Total Exams",
        value: usage.examsAttempted ?? 0,
        caption: "Tracked across account history",
        icon: "bi-ui-checks-grid",
      },
      {
        label: "This Month",
        value: usage.examsThisMonth ?? 0,
        caption: "Active cycle performance",
        icon: "bi-calendar-week",
      },
      {
        label: "Certificates",
        value: usage.certificatesGenerated ?? 0,
        caption: "Issued from completions",
        icon: "bi-award",
      },
    ];
  }, [resolvedRole, usage.certificatesGenerated, usage.examsAttempted, usage.examsThisMonth]);

  const accountHealth = [
    {
      label: "Workspace sync",
      value: loading ? "Refreshing live account state" : "Synced and ready",
      icon: "bi-arrow-repeat",
    },
    {
      label: "Security level",
      value: profile?.isAdmin ? "Privileged account protection" : "Protected personal access",
      icon: "bi-shield-lock",
    },
    {
      label: "Membership state",
      value: `${membership.tier || "free"} / ${membership.status || "trial"}`,
      icon: "bi-stars",
    },
  ];

  const quickAccess = [
    {
      label: "Primary workspace",
      value: resolvedRole === "teacher" ? "Teacher Panel" : resolvedRole === "admin" ? "Admin Control Center" : "Student Dashboard",
      icon: "bi-grid-1x2",
    },
    {
      label: "Performance visibility",
      value: resolvedRole === "student" ? "Results and progress history" : "Attempts and reporting visibility",
      icon: "bi-graph-up-arrow",
    },
    {
      label: "Identity layer",
      value: "Name, email, role, timeline, and account metadata",
      icon: "bi-person-vcard",
    },
  ];

  const preferenceRows = [
    { label: "Email notifications", value: preferences.emailNotifications ? "On" : "Off" },
    { label: "Marketing emails", value: preferences.marketingEmails ? "On" : "Off" },
    { label: "Upgrade reminders", value: preferences.upgradeReminders ? "On" : "Off" },
  ];

  const detailRows = [
    { label: "Full name", value: profile?.name || "Not available" },
    { label: "Email", value: profile?.email || "Not available" },
    { label: "Role", value: resolvedRole },
    { label: "Password", value: "Protected for security" },
    { label: "Admin access", value: profile?.isAdmin ? "Enabled" : "Disabled" },
    { label: "Joined on", value: formatDate(profile?.createdAt) },
  ];

  const activityRows = [
    { label: "Exams attempted", value: usage.examsAttempted ?? 0 },
    { label: "Exams this month", value: usage.examsThisMonth ?? 0 },
    { label: "Total time spent", value: `${usage.totalTimeSpent ?? 0} min` },
    { label: "Certificates generated", value: usage.certificatesGenerated ?? 0 },
    { label: "Last exam date", value: formatDate(usage.lastExamDate) },
    { label: "Workspace state", value: loading ? "Syncing account" : "Ready" },
  ];

  const securityRows = [
    { label: "Account protection", value: profile?.isAdmin ? "High privilege protection" : "Standard protected account" },
    { label: "Password visibility", value: "Hidden and protected" },
    { label: "Notification channel", value: preferences.emailNotifications ? "Email channel active" : "Email channel muted" },
    { label: "Identity verification", value: profile?._id ? "Account linked to database record" : "Local session profile" },
    { label: "Access tier", value: resolvedRole === "admin" ? "Platform-wide scope" : resolvedRole === "teacher" ? "Instruction scope" : "Learner scope" },
    { label: "Session state", value: loading ? "Refreshing live profile" : "Stable active session" },
  ];

  const billingRows = [
    { label: "Current tier", value: membership.tier || "free" },
    { label: "Current status", value: membership.status || "trial" },
    { label: "Billing cycle", value: membership.billingCycle || "monthly" },
    { label: "Membership started", value: formatDate(membership.startDate) },
    { label: "Membership expiry", value: formatDate(membership.expiryDate) },
    { label: "Trial ends", value: formatDate(membership.trialEndsAt) },
  ];

  const tabItems = [
    { id: "overview", label: "Overview", icon: "bi-grid" },
    { id: "activity", label: "Activity", icon: "bi-bar-chart-line" },
    { id: "security", label: "Security", icon: "bi-shield-lock" },
    { id: "billing", label: "Billing", icon: "bi-credit-card-2-front" },
  ];

  return (
    <div className="profile-page">
      <div className="profile-orb profile-orb--one" aria-hidden="true" />
      <div className="profile-orb profile-orb--two" aria-hidden="true" />

      <div className="container py-5">
        <div className="profile-shell">
          <aside className="profile-rail">
            <div className="profile-identity-card">
              <div className="profile-avatar">
                {(profile?.name || "U").charAt(0).toUpperCase()}
              </div>
              <p className="profile-kicker">Account center</p>
              <h2>{profile?.name || "User"}</h2>
              <p className="profile-identity-email">{profile?.email || "Email not available"}</p>

              <div className="profile-badge-stack">
                <span className="profile-badge-pill">{resolvedRole.toUpperCase()}</span>
                <span className="profile-badge-pill profile-badge-pill--soft">
                  {profile?.isAdmin ? "Privileged access" : "Protected account"}
                </span>
              </div>

              <div className="profile-identity-meta">
                <div>
                  <span>Account ID</span>
                  <strong>{profile?._id || "Not linked yet"}</strong>
                </div>
                <div>
                  <span>Created</span>
                  <strong>{formatDate(profile?.createdAt)}</strong>
                </div>
                <div>
                  <span>Last exam</span>
                  <strong>{formatDate(usage.lastExamDate)}</strong>
                </div>
              </div>
            </div>

            <div className="profile-panel profile-panel--rail">
              <div className="profile-panel-head">
                <div>
                  <p className="profile-section-tag">Account health</p>
                  <h4>Status overview</h4>
                </div>
              </div>

              <div className="profile-stack">
                {accountHealth.map((item) => (
                  <div className="profile-row profile-row--rich" key={item.label}>
                    <div className="profile-row-icon">
                      <i className={`bi ${item.icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-panel profile-panel--rail">
              <div className="profile-panel-head">
                <div>
                  <p className="profile-section-tag">Quick access</p>
                  <h4>Workspace capabilities</h4>
                </div>
              </div>

              <div className="profile-stack">
                {quickAccess.map((item) => (
                  <div className="profile-row profile-row--rich" key={item.label}>
                    <div className="profile-row-icon">
                      <i className={`bi ${item.icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="profile-main">
            <section className="profile-banner">
              <div className="profile-banner-copy">
                <p className="profile-kicker">Personal workspace</p>
                <h1>{profile?.name || "Your profile"}</h1>
                <p className="profile-lead">
                  {roleCopy[resolvedRole] || roleCopy.student}
                </p>

                <div className="profile-chip-row">
                  <span className="profile-chip">
                    <i className="bi bi-envelope" aria-hidden="true" />
                    {profile?.email || "Email not available"}
                  </span>
                  <span className="profile-chip">
                    <i className="bi bi-person-workspace" aria-hidden="true" />
                    {resolvedRole.toUpperCase()} workspace
                  </span>
                  <span className="profile-chip">
                    <i className="bi bi-lightning-charge" aria-hidden="true" />
                    {loading ? "Live refresh in progress" : "Live account data ready"}
                  </span>
                </div>
              </div>

              <div className="profile-spotlight">
                <p className="profile-section-tag">Current focus</p>
                <h3>{resolvedRole === "admin" ? "Full control mode" : resolvedRole === "teacher" ? "Teaching command view" : "Learning progress mode"}</h3>
                <p className="mb-0">
                  {resolvedRole === "admin"
                    ? "Monitor platform analytics, users, and exam performance from one command surface."
                    : resolvedRole === "teacher"
                      ? "Keep assessments, activity, and classroom reporting aligned in one workflow."
                      : "Track exams, scores, and personal progress with a cleaner account overview."}
                </p>
              </div>
            </section>

            <section className="profile-toolbar">
              <div className="profile-tab-row">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`profile-tab ${activeTab === tab.id ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`bi ${tab.icon}`} aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="profile-action-row">
                <button type="button" className="profile-action-btn">
                  <i className="bi bi-pencil-square" aria-hidden="true" />
                  <span>Edit profile</span>
                </button>
                <button type="button" className="profile-action-btn profile-action-btn--soft">
                  <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                  <span>Open workspace</span>
                </button>
              </div>
            </section>

            <section className="profile-stats-grid">
              {stats.map((item) => (
                <article className="profile-stat-card" key={item.label}>
                  <div className="profile-stat-icon">
                    <i className={`bi ${item.icon}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p>{item.label}</p>
                    <h3>{item.value}</h3>
                    <small>{item.caption}</small>
                  </div>
                </article>
              ))}
            </section>

            {activeTab === "overview" && (
              <section className="profile-content-grid">
                <article className="profile-panel profile-panel--wide">
                  <div className="profile-panel-head">
                    <div>
                      <p className="profile-section-tag">Account details</p>
                      <h4>Login and identity information</h4>
                    </div>
                    {loading && <span className="badge text-bg-dark">Refreshing</span>}
                  </div>

                  <div className="profile-detail-grid">
                    {detailRows.map((item) => (
                      <div className="profile-detail-card" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="profile-panel">
                  <div className="profile-panel-head">
                    <div>
                      <p className="profile-section-tag">Membership</p>
                      <h4>Plan and billing state</h4>
                    </div>
                  </div>

                  <div className="profile-stack">
                    <div className="profile-row"><span>Tier</span><strong>{membership.tier || "free"}</strong></div>
                    <div className="profile-row"><span>Status</span><strong>{membership.status || "trial"}</strong></div>
                    <div className="profile-row"><span>Start date</span><strong>{formatDate(membership.startDate)}</strong></div>
                    <div className="profile-row"><span>Expiry date</span><strong>{formatDate(membership.expiryDate)}</strong></div>
                    <div className="profile-row"><span>Billing cycle</span><strong>{membership.billingCycle || "monthly"}</strong></div>
                  </div>
                </article>

                <article className="profile-panel">
                  <div className="profile-panel-head">
                    <div>
                      <p className="profile-section-tag">Preferences</p>
                      <h4>Notification settings</h4>
                    </div>
                  </div>

                  <div className="profile-stack">
                    {preferenceRows.map((item) => (
                      <div className="profile-row" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            )}

            {activeTab === "activity" && (
              <section className="profile-content-grid">
                <article className="profile-panel profile-panel--wide">
                  <div className="profile-panel-head">
                    <div>
                      <p className="profile-section-tag">Activity</p>
                      <h4>Usage snapshot</h4>
                    </div>
                  </div>

                  <div className="profile-detail-grid">
                    {activityRows.map((item) => (
                      <div className="profile-detail-card" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="profile-panel">
                  <div className="profile-panel-head">
                    <div>
                      <p className="profile-section-tag">Performance pulse</p>
                      <h4>Current account momentum</h4>
                    </div>
                  </div>

                  <div className="profile-stack">
                    <div className="profile-row"><span>Exam velocity</span><strong>{usage.examsThisMonth ?? 0} active this month</strong></div>
                    <div className="profile-row"><span>Completion archive</span><strong>{usage.examsAttempted ?? 0} total tracked attempts</strong></div>
                    <div className="profile-row"><span>Recognition output</span><strong>{usage.certificatesGenerated ?? 0} certificates issued</strong></div>
                  </div>
                </article>
              </section>
            )}

            {activeTab === "security" && (
              <section className="profile-content-grid">
                <article className="profile-panel profile-panel--wide">
                  <div className="profile-panel-head">
                    <div>
                      <p className="profile-section-tag">Security</p>
                      <h4>Protection and access overview</h4>
                    </div>
                  </div>

                  <div className="profile-detail-grid">
                    {securityRows.map((item) => (
                      <div className="profile-detail-card" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            )}

            {activeTab === "billing" && (
              <section className="profile-content-grid">
                <article className="profile-panel profile-panel--wide">
                  <div className="profile-panel-head">
                    <div>
                      <p className="profile-section-tag">Billing</p>
                      <h4>Membership and plan timeline</h4>
                    </div>
                  </div>

                  <div className="profile-detail-grid">
                    {billingRows.map((item) => (
                      <div className="profile-detail-card" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;
