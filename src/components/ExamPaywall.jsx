import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/membership.css';
import { apiUrl } from '../utils/api';

function ExamPaywall({ onUpgradeClick }) {
  const [accessStatus, setAccessStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem('user'))?._id;
        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await axios.post(
          apiUrl('/api/membership/check-exam-access'),
          {},
          { headers: { 'x-user-id': userId } }
        );
        setAccessStatus(res.data);
      } catch (err) {
        console.error('Access check failed', err);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (loading) return null;
  if (!accessStatus) return null;

  if (!accessStatus.canAccess) {
    return (
      <div className="paywall-banner alert alert-warning">
        <div className="paywall-content">
          <div className="paywall-icon">
            <i className="bi bi-exclamation-triangle-fill" />
          </div>
          <div className="paywall-message">
            <h5>Exam Limit Reached</h5>
            <p>{accessStatus.message}</p>
            {accessStatus.reason === 'subscription_expired' && (
              <p className="paywall-hint">Your subscription has expired. Upgrade to continue taking exams.</p>
            )}
            {accessStatus.reason === 'limit_exceeded' && (
              <p className="paywall-hint">You can take more exams next month or upgrade to Premium/Pro for unlimited attempts.</p>
            )}
          </div>
          <button className="btn btn-primary" onClick={onUpgradeClick}>
            <i className="bi bi-star-fill me-2" />
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default ExamPaywall;
