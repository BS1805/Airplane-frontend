import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(empId, password);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-illustration">
          <div className="auth-illustration-overlay">
            <div className="auth-hello">
              Hello,<span> Crew!</span>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <h2 className="auth-title">Welcome back</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field auth-field--floating">
              <div className="auth-input-wrapper auth-input-wrapper--with-icon">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.31 0-6 2.02-6 4.5 0 .28.22.5.5.5h11a.5.5 0 0 0 .5-.5c0-2.48-2.69-4.5-6-4.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  id="empId"
                  type="number"
                  className="auth-input"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder=" "
                  autoComplete="username"
                  required
                />
                <label className="auth-label auth-label--floating" htmlFor="empId">
                  Employee ID
                </label>
              </div>
            </div>

            <div className="auth-field auth-field--floating">
              <div className="auth-input-wrapper auth-input-wrapper--with-icon">
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path
                      d="M17 10V8a5 5 0 0 0-10 0v2H6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1Zm-8-2a3 3 0 0 1 6 0v2H9Zm3 7.75a1.75 1.75 0 1 1 1.75-1.75A1.75 1.75 0 0 1 12 15.75Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  autoComplete="current-password"
                  required
                />
                <label className="auth-label auth-label--floating" htmlFor="password">
                  Password
                </label>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

