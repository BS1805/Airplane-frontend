import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../auth/AuthContext';

// Request body sent to POST /api/Sales/preview
interface SalePreviewRequest {
  clientId: string;
  flightNumber: string;
  flightDate: string;
  passengerCount: string;
  preselectedFlightId?: number;
  userId?: string;
}

// Response from the API
interface SalePreviewResponse {
  isValid: boolean;
  message: string;
  clientId: number;
  passengerFirstName: string;
  passengerLastName: string;
  flightId: number;
  flightNumber: string;
  flightDate: string;
  depTime: string;
  arrTime: string;
  airportDeparture: string;
  airportArrival: string;
  passengerCount: number;
  unitPrice: number;
  totalPrice: number;
  canProceedToStep2: boolean;
}

// UI form state
interface FormState {
  clientId: string;
  flightNumber: string;
  flightDate: string;
  passengerCount: string;
  preselectedFlightId: string;
  userId: string;
}

export function SalesPreviewPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState<FormState>({
    clientId: '',
    flightNumber: '',
    flightDate: '',
    passengerCount: '',
    preselectedFlightId: '',
    userId: ''
  });

  const [preview, setPreview] = useState<SalePreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPreview = async () => {
    const body: SalePreviewRequest = {
      clientId: form.clientId.trim(),
      flightNumber: form.flightNumber.trim(),
      flightDate: form.flightDate,
      passengerCount: form.passengerCount.trim()
    };

    if (form.preselectedFlightId.trim()) {
      body.preselectedFlightId = Number(form.preselectedFlightId);
    }
    if (form.userId.trim()) {
      body.userId = form.userId.trim();
    }

    try {
      setLoading(true);
      setError(null);
      setPreview(null);
      const res = await apiClient.post<SalePreviewResponse>('/api/Sales/preview', body);
      setPreview(res.data);
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Could not load preview.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (val: string) => {
    try {
      return new Date(val).toLocaleDateString();
    } catch {
      return val || '-';
    }
  };

  const fmtTime = (val: string) => (val ? val.substring(0, 5) : '-');

  const fmtPrice = (val: number) =>
    val?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '-';

  return (
    <div className="auth-page flight-search-page">
      <div className="auth-shell">
        {/* ── LEFT: form panel ── */}
        <aside className="auth-illustration">
          <div className="flight-search-overlay">
            {/* Back / Logout */}
            <div className="flex gap-6 mb-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/')}
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
              Sales<span> Preview</span>
            </div>

            <div className="flight-search-form">
              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">Client ID</div>
                  <input
                    type="number"
                    className="flight-search-input"
                    value={form.clientId}
                    onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}
                    placeholder="e.g. 101"
                  />
                </div>

                <div>
                  <div className="flight-search-label">Passenger Count</div>
                  <input
                    type="number"
                    className="flight-search-input"
                    value={form.passengerCount}
                    onChange={(e) => setForm((p) => ({ ...p, passengerCount: e.target.value }))}
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">Flight Number</div>
                  <input
                    type="text"
                    className="flight-search-input"
                    value={form.flightNumber}
                    onChange={(e) => setForm((p) => ({ ...p, flightNumber: e.target.value }))}
                    placeholder="e.g. AA100"
                  />
                </div>

                <div>
                  <div className="flight-search-label">Flight Date</div>
                  <input
                    type="date"
                    className="flight-search-input"
                    value={form.flightDate}
                    onChange={(e) => setForm((p) => ({ ...p, flightDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">Preselected Flight ID</div>
                  <input
                    type="number"
                    className="flight-search-input"
                    value={form.preselectedFlightId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, preselectedFlightId: e.target.value }))
                    }
                    placeholder="optional"
                  />
                </div>

                <div>
                  <div className="flight-search-label">User ID</div>
                  <input
                    type="text"
                    className="flight-search-input"
                    value={form.userId}
                    onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value }))}
                    placeholder="optional"
                  />
                </div>
              </div>

              <button type="button" onClick={onPreview} className="flight-search-button">
                Preview sale
              </button>
            </div>
          </div>
        </aside>

        {/* ── RIGHT: preview panel ── */}
        <section className="auth-panel">
          <div className="mb-4">
            <h2 className="auth-title">Preview</h2>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-sm text-slate-500 mt-2">Loading preview…</p>
          )}

          {/* API / network error */}
          {!loading && error && (
            <div className="sale-preview-invalid">
              <span className="sale-preview-invalid-icon">✕</span>
              <div>
                <div className="sale-preview-invalid-title">Validation failed</div>
                <div className="sale-preview-invalid-msg">{error}</div>
              </div>
            </div>
          )}

          {/* Business-level invalid (isValid=false) */}
          {!loading && !error && preview && !preview.isValid && (
            <div className="sale-preview-invalid">
              <span className="sale-preview-invalid-icon">✕</span>
              <div>
                <div className="sale-preview-invalid-title">Validation failed</div>
                <div className="sale-preview-invalid-msg">{preview.message}</div>
              </div>
            </div>
          )}

          {/* Idle — nothing searched yet */}
          {!loading && !error && !preview && (
            <p className="text-sm text-slate-400 mt-1">
              Fill in the form and click <strong>Preview sale</strong> to validate.
            </p>
          )}

          {/* Success card */}
          {!loading && !error && preview && preview.isValid && (
            <div className="sale-preview-card">
              {/* Status badge */}
              <div className="sale-preview-badge sale-preview-badge--ok">
                ✓ &nbsp;Ready to proceed
              </div>

              {/* Passenger */}
              <div className="sale-preview-section">
                <div className="sale-preview-section-title">Passenger</div>
                <div className="sale-preview-grid">
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Name</span>
                    <span className="sale-preview-value">
                      {preview.passengerFirstName} {preview.passengerLastName}
                    </span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Client ID</span>
                    <span className="sale-preview-value">{preview.clientId}</span>
                  </div>
                </div>
              </div>

              <div className="sale-preview-divider" />

              {/* Flight */}
              <div className="sale-preview-section">
                <div className="sale-preview-section-title">Flight</div>
                <div className="sale-preview-grid">
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Flight</span>
                    <span className="sale-preview-value">{preview.flightNumber}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Date</span>
                    <span className="sale-preview-value">{fmt(preview.flightDate)}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Departure</span>
                    <span className="sale-preview-value">
                      {preview.airportDeparture} &nbsp;
                      <span className="sale-preview-time">{fmtTime(preview.depTime)}</span>
                    </span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Arrival</span>
                    <span className="sale-preview-value">
                      {preview.airportArrival} &nbsp;
                      <span className="sale-preview-time">{fmtTime(preview.arrTime)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="sale-preview-divider" />

              {/* Pricing */}
              <div className="sale-preview-section">
                <div className="sale-preview-section-title">Pricing</div>
                <div className="sale-preview-grid">
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Unit price</span>
                    <span className="sale-preview-value">{fmtPrice(preview.unitPrice)}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Passengers</span>
                    <span className="sale-preview-value">{preview.passengerCount}</span>
                  </div>
                </div>
                <div className="sale-preview-total">
                  <span className="sale-preview-total-label">Total</span>
                  <span className="sale-preview-total-value">{fmtPrice(preview.totalPrice)}</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
