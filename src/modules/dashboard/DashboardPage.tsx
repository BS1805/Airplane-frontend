import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="auth-page flight-search-page">
      <div className="auth-shell">
        <aside className="auth-illustration">
          <div className="flight-search-overlay">
            <div className="flex gap-6 mb-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/login')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>

            <div className="auth-hello">
              Operations<span> Hub</span>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="mb-4">
            <h2 className="auth-title">Dashboard</h2>
            <p className="auth-subtitle">Choose where you want to go.</p>
          </div>

          <div className="dashboard-grid">
            <button
              type="button"
              onClick={() => navigate('/flights')}
              className="dashboard-card dashboard-card--primary"
            >
              <div className="dashboard-card-tag">Flights</div>
              <h2 className="dashboard-card-title">Flight search</h2>
              <p className="dashboard-card-text">
                Search flight schedules by number, route or date. Review timings, routing and
                pricing in one place.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="dashboard-card"
            >
              <div className="dashboard-card-tag">Tickets</div>
              <h2 className="dashboard-card-title">Ticket search</h2>
              <p className="dashboard-card-text">
                Look up tickets by passenger, ticket ID or flight details to support check‑in and
                customer care.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate('/sales')}
              className="dashboard-card"
            >
              <div className="dashboard-card-tag">Sales</div>
              <h2 className="dashboard-card-title">Sales preview</h2>
              <p className="dashboard-card-text">
                Preview passenger and flight details, prices, and validate a sale before
                proceeding.
              </p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

