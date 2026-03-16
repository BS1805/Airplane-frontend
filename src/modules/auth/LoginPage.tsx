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
              <div className="auth-input-wrapper">
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
              <div className="auth-input-wrapper">
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

