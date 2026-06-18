import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/membership.css';

function MembershipStatus() {
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user'))?._id;
        if (!userId) return;

        const res = await axios.get('http://127.0.0.1:5000/api/membership/status', {
          headers: { 'x-user-id': userId }
        });
        setMembership(res.data);
      } catch (err) {
        console.error('Failed to fetch membership status', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) return <div className="membership-loading">Loading...</div>;
  if (!membership) return null;

  const tierColors = {
    free: '#6c757d',
    premium: '#0d6efd',
    pro: '#ffc107'
  };

  const tierIcons = {
    free: 'bi-star',
    premium: 'bi-star-fill',
    pro: 'bi-gem'
  };

  return (
    <div className="membership-card" style={{ borderLeft: `4px solid ${tierColors[membership.tier]}` }}>
      <div className="membership-header">
        <div className="membership-info">
          <div className="membership-tier-badge">
            <i className={`bi ${tierIcons[membership.tier]}`} />
            {membership.tier.toUpperCase()}
          </div>
          <h5 className="membership-title mb-1">
            {membership.tier === 'free' ? 'Free Plan' : `${membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)} Plan`}
          </h5>
          <p className="membership-status mb-0">
            {membership.status === 'trial'
              ? `Trial ends in ${Math.ceil((new Date(membership.trialEndsAt) - Date.now()) / (1000 * 60 * 60 * 24))} days`
              : membership.status === 'active'
              ? `Expires on ${new Date(membership.expiryDate).toLocaleDateString()}`
              : `Status: ${membership.status}`
            }
          </p>
        </div>
        <div className="membership-quota">
          <span className="quota-badge" style={{ backgroundColor: tierColors[membership.tier] }}>
            {membership.examsRemainingThisMonth} / {membership.limits.examsPerMonth}
          </span>
          <p className="quota-label">Exams this month</p>
        </div>
      </div>

      <div className="membership-features">
        <h6 className="features-title">Features Included:</h6>
        <ul className="features-list">
          {membership.features.advancedAnalytics && (
            <li><i className="bi bi-check-circle-fill" /> Advanced Analytics</li>
          )}
          {membership.features.certificateGeneration && (
            <li><i className="bi bi-check-circle-fill" /> Certificate Generation</li>
          )}
          {membership.features.prioritySupport && (
            <li><i className="bi bi-check-circle-fill" /> Priority Support</li>
          )}
          {membership.features.adFree && (
            <li><i className="bi bi-check-circle-fill" /> Ad-Free Experience</li>
          )}
          {membership.features.advancedProctoring && (
            <li><i className="bi bi-check-circle-fill" /> Advanced Proctoring</li>
          )}
          {membership.features.customReports && (
            <li><i className="bi bi-check-circle-fill" /> Custom Reports</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default MembershipStatus;
