import { useState } from "react";
import MembershipStatus from "../components/MembershipStatus";
import UpgradeModal from "../components/UpgradeModal";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/membership.css";
import "../styles/membership-page.css";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    badge: "Start Here",
    tone: "free",
    cta: "Your Base Plan",
    disabled: true,
    summary: "Best for trying the platform and taking a few exams every month.",
    highlights: ["2 exams monthly", "Basic analytics", "Standard proctoring"],
    features: [
      { text: "2 exams per month", included: true },
      { text: "Basic analytics dashboard", included: true },
      { text: "Standard proctoring", included: true },
      { text: "Certificates", included: false },
      { text: "Priority support", included: false }
    ]
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    badge: "Most Popular",
    tone: "premium",
    cta: "Upgrade to Premium",
    summary: "Best for serious students who want unlimited attempts and deeper insights.",
    highlights: ["Unlimited exams", "Advanced analytics", "Certificates included"],
    features: [
      { text: "Unlimited exams", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Advanced proctoring", included: true },
      { text: "Certificate generation", included: true },
      { text: "Standard support", included: true }
    ]
  },
  {
    name: "Pro",
    price: "$19.99",
    period: "/month",
    badge: "Power Users",
    tone: "pro",
    cta: "Upgrade to Pro",
    summary: "Best for institutions, trainers, and high-volume exam management.",
    highlights: ["Everything in Premium", "Custom reports", "Priority support"],
    features: [
      { text: "Everything in Premium", included: true },
      { text: "Custom reports", included: true },
      { text: "Unlimited storage", included: true },
      { text: "Priority support", included: true },
      { text: "Dedicated manager", included: true }
    ]
  }
];

const compareRows = [
  { label: "Monthly exam attempts", values: ["2 exams", "Unlimited", "Unlimited"] },
  { label: "Analytics depth", values: ["Basic", "Advanced", "Advanced + custom reports"] },
  { label: "Proctoring", values: ["Standard", "Advanced", "Advanced"] },
  { label: "Certificates", values: ["No", "Yes", "Yes"] },
  { label: "Support", values: ["Community", "Standard", "Priority + manager"] }
];

function MembershipPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgradeSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="membership-page">
      <div className="membership-page__glow membership-page__glow--one" aria-hidden="true" />
      <div className="membership-page__glow membership-page__glow--two" aria-hidden="true" />

      <div className="container membership-page__container">
        <section className="membership-hero">
          <div className="membership-hero__copy">
            <span className="membership-kicker">Plans & Billing</span>
            <h1>Choose a plan that stays clear, simple, and easy to grow with.</h1>
            <p>
              Start free, understand your monthly exam limits instantly, and upgrade only when you need more access,
              stronger analytics, and premium support.
            </p>

            <div className="membership-hero__chips">
              <span><i className="bi bi-check2-circle" /> Monthly limits visible</span>
              <span><i className="bi bi-graph-up-arrow" /> Clear plan comparison</span>
              <span><i className="bi bi-shield-check" /> Secure upgrade flow</span>
            </div>
          </div>

          <div className="membership-hero__panel">
            <div className="membership-hero__metric">
              <strong>3</strong>
              <span>simple plans</span>
            </div>
            <div className="membership-hero__metric">
              <strong>Unlimited</strong>
              <span>exams on paid plans</span>
            </div>
            <div className="membership-hero__metric">
              <strong>Instant</strong>
              <span>upgrade activation</span>
            </div>
          </div>
        </section>

        <section className="membership-section">
          <div className="membership-section__head">
            <div>
              <span className="membership-section__eyebrow">Current Access</span>
              <h3>Your current plan</h3>
            </div>
            <p>Check your active tier, remaining usage, and available benefits before choosing an upgrade.</p>
          </div>
          <MembershipStatus />
        </section>

        <section className="membership-section">
          <div className="membership-section__head">
            <div>
              <span className="membership-section__eyebrow">Available Plans</span>
              <h3>Pick the plan that matches your exam usage</h3>
            </div>
            <p>Each card shows who the plan is for, what you get, and when it makes sense to upgrade.</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`pricing-card pricing-card--${plan.tone} ${plan.name === "Premium" ? "featured" : ""} reveal`}
              >
                <div className="plan-badge">{plan.badge}</div>
                <div className="plan-header">
                  <div>
                    <h4>{plan.name}</h4>
                    <p className="plan-summary">{plan.summary}</p>
                  </div>
                  <p className="plan-price">
                    {plan.price}
                    <span>{plan.period}</span>
                  </p>
                </div>

                <div className="plan-highlight-strip">
                  {plan.highlights.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className={feature.included ? "" : "is-disabled"}>
                      <i className={`bi ${feature.included ? "bi-check-circle-fill" : "bi-dash-circle"}`} />
                      {feature.text}
                    </li>
                  ))}
                </ul>

                <button
                  className={`plan-action ${plan.disabled ? "plan-action--muted" : ""}`}
                  onClick={() => !plan.disabled && setShowUpgradeModal(true)}
                  disabled={plan.disabled}
                >
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="membership-section">
          <div className="membership-section__head">
            <div>
              <span className="membership-section__eyebrow">Compare Quickly</span>
              <h3>Understand the difference in one glance</h3>
            </div>
            <p>No confusing pricing table, just the features that matter most while choosing a plan.</p>
          </div>

          <div className="comparison-card">
            <div className="comparison-table">
              <div className="comparison-row comparison-row--head">
                <div>Feature</div>
                <div>Free</div>
                <div>Premium</div>
                <div>Pro</div>
              </div>
              {compareRows.map((row) => (
                <div className="comparison-row" key={row.label}>
                  <div>{row.label}</div>
                  {row.values.map((value) => (
                    <div key={value}>{value}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="membership-section faq-shell">
          <div className="membership-section__head">
            <div>
              <span className="membership-section__eyebrow">FAQ</span>
              <h3>Common questions</h3>
            </div>
            <p>Short answers for the things users usually ask before upgrading.</p>
          </div>

          <div className="accordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                  Can I change my plan anytime?
                </button>
              </h2>
              <div id="faq1" className="accordion-collapse collapse show">
                <div className="accordion-body">
                  Yes. You can upgrade whenever you need more exam access, and the new plan becomes active right away.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                  What happens when the free monthly limit is over?
                </button>
              </h2>
              <div id="faq2" className="accordion-collapse collapse">
                <div className="accordion-body">
                  Once your free quota is finished, new exam starts are blocked until the next monthly reset or until you upgrade.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                  Which plan is best for regular students?
                </button>
              </h2>
              <div id="faq3" className="accordion-collapse collapse">
                <div className="accordion-body">
                  Premium is usually the best fit because it removes monthly limits and unlocks better analytics without being too expensive.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                  Is Pro only for institutions?
                </button>
              </h2>
              <div id="faq4" className="accordion-collapse collapse">
                <div className="accordion-body">
                  Pro is great for institutions, trainers, and anyone who needs custom reporting, larger-scale usage, and faster support.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <UpgradeModal
        show={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}

export default MembershipPage;
