import { useState } from 'react';
import axios from 'axios';
import '../styles/membership.css';
import { apiUrl } from '../utils/api';

function UpgradeModal({ show, onClose, onUpgradeSuccess }) {
  const [selectedTier, setSelectedTier] = useState('premium');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pricing = {
    premium: {
      monthly: { price: '$9.99', amount: 999 },
      annual: { price: '$99.90', amount: 9990, savings: 'Save 17%' }
    },
    pro: {
      monthly: { price: '$19.99', amount: 1999 },
      annual: { price: '$199.90', amount: 19990, savings: 'Save 17%' }
    }
  };

  const features = {
    premium: [
      'Unlimited exam attempts',
      'Advanced analytics',
      'Certificate generation',
      'Ad-free experience',
      'Advanced proctoring',
      'Priority support'
    ],
    pro: [
      'Everything in Premium',
      'Custom reports',
      'Unlimited storage',
      'Priority support',
      'Advanced proctoring',
      'Dedicated account manager'
    ]
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    try {
      const userId = JSON.parse(localStorage.getItem('user'))?._id;
      if (!userId) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      const res = await axios.post(
        apiUrl('/api/membership/upgrade'),
        { tier: selectedTier, billingCycle },
        { headers: { 'x-user-id': userId } }
      );

      const user = JSON.parse(localStorage.getItem('user'));
      user.membership = res.data.user.membership;
      localStorage.setItem('user', JSON.stringify(user));

      onUpgradeSuccess();
      onClose();
    } catch (err) {
      console.error('Upgrade failed', err);
      setError(err.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content upgrade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upgrade Your Plan</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="billing-toggle mb-4">
            <label className="toggle-label">
              <input
                type="radio"
                value="monthly"
                checked={billingCycle === 'monthly'}
                onChange={(e) => setBillingCycle(e.target.value)}
              />
              <span>Monthly</span>
            </label>
            <label className="toggle-label">
              <input
                type="radio"
                value="annual"
                checked={billingCycle === 'annual'}
                onChange={(e) => setBillingCycle(e.target.value)}
              />
              <span>Annual <span className="savings-badge">{pricing[selectedTier].annual.savings}</span></span>
            </label>
          </div>

          <div className="tier-selector">
            {['premium', 'pro'].map(tier => (
              <div
                key={tier}
                className={`tier-option ${selectedTier === tier ? 'selected' : ''}`}
                onClick={() => setSelectedTier(tier)}
              >
                <div className="tier-header">
                  <h5>{tier.toUpperCase()}</h5>
                  <p className="tier-price">
                    {pricing[tier][billingCycle].price}
                    <span className="tier-period">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </p>
                </div>

                <ul className="tier-features">
                  {features[tier].map((feature, idx) => (
                    <li key={idx}>
                      <i className="bi bi-check-circle-fill" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn btn-upgrade ${selectedTier === tier ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedTier(tier)}
                >
                  {selectedTier === tier ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Upgrade to ${selectedTier.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
