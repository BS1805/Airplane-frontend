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

interface PrintTicketResponse {
  isFound: boolean;
  message: string;
  buyId: number;
  buyDate: string;
  buyTime: string;
  clientId: number;
  passengerFirstName: string;
  passengerLastName: string;
  flightNumber: string;
  flightDate: string;
  departureTime: string;
  arrivalTime: string;
  airportDeparture: string;
  airportArrival: string;
  ticketCount: number;
  totalPrice: number;
  seats: string[];
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
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

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

  const fmtDateOnly = (val: string) => {
    if (!val) {
      return '-';
    }

    const dateParts = val.split('-');
    if (dateParts.length !== 3) {
      return val;
    }

    const [yearStr, monthStr, dayStr] = dateParts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
      return val;
    }

    return new Date(year, month - 1, day).toLocaleDateString();
  };

  const escapeHtml = (value: string) =>
    value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const renderPrintWindowStatus = (printWindow: Window, title: string, message: string) => {
    const statusHtml = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #f8fafc;
        color: #0f172a;
        font-family: Arial, Helvetica, sans-serif;
      }
      .card {
        width: min(92vw, 560px);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
        padding: 20px;
      }
      h1 {
        margin: 0 0 8px;
        font-size: 1.2rem;
      }
      p {
        margin: 0;
        color: #475569;
      }
    </style>
  </head>
  <body>
    <section class="card">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
    </section>
  </body>
</html>`;

    try {
      printWindow.document.open();
      printWindow.document.write(statusHtml);
      printWindow.document.close();
    } catch {
      // Fallback for browsers that restrict document.open/write on popup windows.
      printWindow.document.body.innerHTML = `
        <section style="margin:24px;font-family:Arial,Helvetica,sans-serif;">
          <h1 style="margin:0 0 8px;">${escapeHtml(title)}</h1>
          <p style="margin:0;color:#475569;">${escapeHtml(message)}</p>
        </section>`;
    }
  };

  const openPrintWindow = (ticket: PrintTicketResponse, printWindow: Window) => {
    const seats = ticket.seats.length > 0 ? ticket.seats.join(', ') : '-';
    const passengerName = `${ticket.passengerFirstName} ${ticket.passengerLastName}`.trim();
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Ticket #${escapeHtml(String(ticket.buyId))}</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
        margin: 24px;
        color: #111827;
      }
      .ticket {
        max-width: 760px;
        margin: 0 auto;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
      }
      .header {
        background: linear-gradient(90deg, #1e3a8a, #2563eb);
        color: white;
        padding: 18px 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
        letter-spacing: 0.03em;
      }
      .content {
        padding: 20px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 18px;
      }
      .label {
        display: block;
        font-size: 11px;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .value {
        display: block;
        font-size: 16px;
        font-weight: 600;
        margin-top: 4px;
      }
      .divider {
        height: 1px;
        background: #e5e7eb;
        margin: 16px 0;
      }
      .footer-note {
        font-size: 12px;
        color: #6b7280;
        margin-top: 18px;
      }
      @media print {
        body {
          margin: 0;
          padding: 8px;
        }
        .ticket {
          border-color: #d1d5db;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    <section class="ticket">
      <header class="header">
        <h1>Flight Ticket</h1>
      </header>
      <div class="content">
        <div class="grid">
          <div>
            <span class="label">Buy ID</span>
            <span class="value">${escapeHtml(String(ticket.buyId))}</span>
          </div>
          <div>
            <span class="label">Purchase date</span>
            <span class="value">${escapeHtml(fmtDateOnly(ticket.buyDate))} ${escapeHtml(fmtTime(ticket.buyTime))}</span>
          </div>
          <div>
            <span class="label">Passenger</span>
            <span class="value">${escapeHtml(passengerName || '-')}</span>
          </div>
          <div>
            <span class="label">Client ID</span>
            <span class="value">${escapeHtml(String(ticket.clientId))}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="grid">
          <div>
            <span class="label">Flight</span>
            <span class="value">${escapeHtml(ticket.flightNumber)}</span>
          </div>
          <div>
            <span class="label">Flight date</span>
            <span class="value">${escapeHtml(fmtDateOnly(ticket.flightDate))}</span>
          </div>
          <div>
            <span class="label">Departure</span>
            <span class="value">${escapeHtml(ticket.airportDeparture)} ${escapeHtml(fmtTime(ticket.departureTime))}</span>
          </div>
          <div>
            <span class="label">Arrival</span>
            <span class="value">${escapeHtml(ticket.airportArrival)} ${escapeHtml(fmtTime(ticket.arrivalTime))}</span>
          </div>
          <div>
            <span class="label">Seats</span>
            <span class="value">${escapeHtml(seats)}</span>
          </div>
          <div>
            <span class="label">Tickets / Total</span>
            <span class="value">${escapeHtml(String(ticket.ticketCount))} / ${escapeHtml(fmtPrice(ticket.totalPrice))}</span>
          </div>
        </div>
        <p class="footer-note">Generated by the sales confirmation screen.</p>
      </div>
    </section>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const onPrintTicket = async () => {
    if (!result?.buyId) {
      setPrintError('Buy ID is missing. Confirm the sale first.');
      return;
    }

    // Open window synchronously from the click event to avoid popup blockers.
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      setPrintError('Could not open print window. Please allow pop-ups and try again.');
      return;
    }
    renderPrintWindowStatus(printWindow, 'Preparing ticket', 'Please wait while ticket data is loading...');

    try {
      setPrinting(true);
      setPrintError(null);

      const res = await apiClient.get<PrintTicketResponse>(
        `/api/Sales/${result.buyId}/print-ticket`
      );

      if (!res.data.isFound) {
        setPrintError(res.data.message || 'Could not load ticket data for printing.');
        return;
      }

      openPrintWindow(res.data, printWindow);
    } catch (e: unknown) {
      const axiosErr = e as { response?: { data?: { message?: string } } };
      const errorMessage =
        axiosErr?.response?.data?.message ?? 'Could not print ticket. Please try again.';
      renderPrintWindowStatus(printWindow, 'Print failed', errorMessage);
      setPrintError(errorMessage);
    } finally {
      setPrinting(false);
    }
  };

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
              <div className="sale-preview-actions">
                <button
                  type="button"
                  className="flight-search-button flight-search-button--secondary"
                  onClick={onPrintTicket}
                  disabled={printing || result.buyId == null}
                >
                  {printing ? 'Preparing ticket...' : 'Print ticket'}
                </button>
                <button
                  type="button"
                  className="flight-search-button"
                  onClick={() => navigate('/')}
                >
                  Go to dashboard
                </button>
              </div>
              {printError && (
                <div className="sale-preview-section">
                  <div className="sale-preview-invalid-msg">{printError}</div>
                </div>
              )}
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

