import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../auth/AuthContext';

// Matches Airlines.API.Contracts.Sales.ConfirmSaleRequest (JSON camelCase)
interface ConfirmSaleRequest {
  clientId: number;
  flightId: number;
  flightNumber: string;
  flightDate: string;
  passengerCount: number;
  unitPrice: number;
  totalPrice: number;
  empId: number;
}

// Matches Airlines.API.Contracts.Sales.ConfirmSaleResponse (JSON camelCase)
interface ConfirmSaleResponse {
  isAccepted: boolean;
  message: string;
  buyId?: number | null;
}

// Minimal shape of data passed from SalesPreviewPage
interface SalePreviewForConfirm {
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
}

export function SalesConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const state = location.state as { preview: SalePreviewForConfirm } | null;

  // If user lands here without preview data, send them back to preview step
  if (!state || !state.preview) {
    navigate('/sales', { replace: true });
    return null;
  }

  const { preview } = state;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConfirmSaleResponse | null>(null);

  const fmtDate = (val: string) => {
    try {
      return new Date(val).toLocaleDateString();
    } catch {
      return val || '-';
    }
  };

  const fmtTime = (val: string) => (val ? val.substring(0, 5) : '-');

  const fmtPrice = (val: number) =>
    val?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '-';

  const onConfirm = async () => {
    // EmpId is required by backend – derive from authenticated user
    const empIdNumber = user?.id ? Number(user.id) : NaN;

    if (!user || Number.isNaN(empIdNumber)) {
      setError('Current user id is missing. Please log in again.');
      return;
    }

    const body: ConfirmSaleRequest = {
      clientId: preview.clientId,
      flightId: preview.flightId,
      flightNumber: preview.flightNumber,
      flightDate: preview.flightDate,
      passengerCount: preview.passengerCount,
      unitPrice: preview.unitPrice,
      totalPrice: preview.totalPrice,
      empId: empIdNumber
    };

    try {
      setSubmitting(true);
      setError(null);
      setResult(null);
      const res = await apiClient.post<ConfirmSaleResponse>('/api/Sales/confirm', body);
      setResult(res.data);
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Could not confirm sale.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page flight-search-page">
      <div className="auth-shell">
        {/* LEFT: navigation + context */}
        <aside className="auth-illustration">
          <div className="flight-search-overlay">
            <div className="flex gap-6 mb-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate('/sales')}
              >
                Back to preview
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
              Sales<span> Confirm</span>
            </div>

            <div className="flight-search-form">
              <p className="text-sm text-slate-300">
                Review the summary on the right and click <strong>Confirm sale</strong> to
                finalize the booking.
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT: confirmation summary + actions */}
        <section className="auth-panel">
          <div className="mb-4">
            <h2 className="auth-title">Confirm sale</h2>
          </div>

          {submitting && (
            <p className="text-sm text-slate-500 mt-2">Confirming sale…</p>
          )}

          {!submitting && error && (
            <div className="sale-preview-invalid">
              <span className="sale-preview-invalid-icon">✕</span>
              <div>
                <div className="sale-preview-invalid-title">Could not confirm</div>
                <div className="sale-preview-invalid-msg">{error}</div>
              </div>
            </div>
          )}

          {!submitting && result && !result.isAccepted && (
            <div className="sale-preview-invalid">
              <span className="sale-preview-invalid-icon">✕</span>
              <div>
                <div className="sale-preview-invalid-title">Sale rejected</div>
                <div className="sale-preview-invalid-msg">{result.message}</div>
              </div>
            </div>
          )}

          {!submitting && result && result.isAccepted && (
            <div className="sale-preview-card">
              <div className="sale-preview-badge sale-preview-badge--ok">
                ✓ &nbsp;Sale confirmed
              </div>
              <div className="sale-preview-section">
                <div className="sale-preview-section-title">Confirmation</div>
                <div className="sale-preview-grid">
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Message</span>
                    <span className="sale-preview-value">{result.message}</span>
                  </div>
                  {result.buyId != null && (
                    <div className="sale-preview-item">
                      <span className="sale-preview-label">Buy ID</span>
                      <span className="sale-preview-value">{result.buyId}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="sale-preview-divider" />
              <button
                type="button"
                className="flight-search-button"
                onClick={() => navigate('/')}
              >
                Go to dashboard
              </button>
            </div>
          )}

          {/* Initial state or when there is no result yet */}
          {!submitting && !result && (
            <div className="sale-preview-card">
              <div className="sale-preview-badge sale-preview-badge--ok">
                ✓ &nbsp;Ready to confirm
              </div>

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

              <div className="sale-preview-section">
                <div className="sale-preview-section-title">Flight</div>
                <div className="sale-preview-grid">
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Flight</span>
                    <span className="sale-preview-value">{preview.flightNumber}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Date</span>
                    <span className="sale-preview-value">{fmtDate(preview.flightDate)}</span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Departure</span>
                    <span className="sale-preview-value">
                      {preview.airportDeparture}{' '}
                      <span className="sale-preview-time">{fmtTime(preview.depTime)}</span>
                    </span>
                  </div>
                  <div className="sale-preview-item">
                    <span className="sale-preview-label">Arrival</span>
                    <span className="sale-preview-value">
                      {preview.airportArrival}{' '}
                      <span className="sale-preview-time">{fmtTime(preview.arrTime)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="sale-preview-divider" />

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
                  <span className="sale-preview-total-value">
                    {fmtPrice(preview.totalPrice)}
                  </span>
                </div>
              </div>

              <div className="sale-preview-divider" />

              <button
                type="button"
                className="flight-search-button"
                onClick={onConfirm}
                disabled={submitting}
              >
                Confirm sale
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

