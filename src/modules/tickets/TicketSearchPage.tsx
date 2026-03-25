import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../auth/AuthContext';

// Matches ASP.NET Core query parameter names
interface TicketSearchQueryParams {
  TicketId?: number;
  ClientId?: number;
  FirstName?: string;
  LastName?: string;
  FlightNumber?: string;
  FlightDate?: string;
  PageNumber: number;
  PageSize: number;
}

// UI state
interface TicketSearchFormState {
  ticketId: string;
  clientId: string;
  firstName: string;
  lastName: string;
  flightNumber: string;
  flightDate: string;
}

interface Ticket {
  ticketId: number;
  clientId: number;
  passengerFirstName: string;
  passengerLastName: string;
  flightNumber: string;
  flightDate: string;
  departureTime: string;
  arrivalTime: string;
  departureAirportId: number;
  arrivalAirportId: number;
  seat: string;
}

interface PagedResponse<T> {
  success: boolean;
  message: string | null;
  data: {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  errors: string[] | null;
}

async function fetchTickets(params: TicketSearchQueryParams) {
  const response = await apiClient.get<PagedResponse<Ticket>>('/api/Tickets/search', {
    params
  });
  return response.data.data.items;
}

export function TicketSearchPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState<TicketSearchFormState>({
    ticketId: '',
    clientId: '',
    firstName: '',
    lastName: '',
    flightNumber: '',
    flightDate: ''
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async () => {
    const params: TicketSearchQueryParams = {
      PageNumber: 1,
      PageSize: 10
    };

    if (form.ticketId.trim()) params.TicketId = Number(form.ticketId);
    if (form.clientId.trim()) params.ClientId = Number(form.clientId);
    if (form.firstName.trim()) params.FirstName = form.firstName.trim();
    if (form.lastName.trim()) params.LastName = form.lastName.trim();
    if (form.flightNumber.trim()) params.FlightNumber = form.flightNumber.trim();
    if (form.flightDate) params.FlightDate = form.flightDate;

    try {
      setLoading(true);
      setError(null);
      const items = await fetchTickets(params);
      setTickets(items);
    } catch (e) {
      setError('Could not load tickets.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flight-search-page">
      <div className="auth-shell">
        <aside className="auth-illustration">
          <div className="flight-search-overlay">
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
              Ticket<span> Search</span>
            </div>

            <div className="flight-search-form">
              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">Ticket ID</div>
                  <input
                    type="number"
                    className="flight-search-input"
                    value={form.ticketId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        ticketId: e.target.value
                      }))
                    }
                    placeholder="e.g. 1001"
                  />
                </div>

                <div>
                  <div className="flight-search-label">Client ID</div>
                  <input
                    type="number"
                    className="flight-search-input"
                    value={form.clientId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        clientId: e.target.value
                      }))
                    }
                    placeholder="e.g. 2001"
                  />
                </div>
              </div>

              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">First name</div>
                  <input
                    type="text"
                    className="flight-search-input"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        firstName: e.target.value
                      }))
                    }
                    placeholder="e.g. John"
                  />
                </div>

                <div>
                  <div className="flight-search-label">Last name</div>
                  <input
                    type="text"
                    className="flight-search-input"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        lastName: e.target.value
                      }))
                    }
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">Flight number</div>
                  <input
                    type="text"
                    className="flight-search-input"
                    value={form.flightNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        flightNumber: e.target.value
                      }))
                    }
                    placeholder="e.g. AA100"
                  />
                </div>

                <div>
                  <div className="flight-search-label">Flight date</div>
                  <input
                    type="date"
                    className="flight-search-input"
                    value={form.flightDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        flightDate: e.target.value
                      }))
                    }
                  />
                </div>
              </div>

              <button type="button" onClick={onSearch} className="flight-search-button">
                Search tickets
              </button>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="results-header">
            <h2 className="auth-title">Results</h2>
            {!loading && tickets.length > 0 && (
              <span className="results-count-badge">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Passenger</th>
                  <th>Flight</th>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Seat</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr className="table-loading-row">
                    <td colSpan={6}>
                      <div className="table-loading-content">
                        <span className="table-spinner" />
                        Loading tickets…
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && (error || tickets.length === 0) && (
                  <tr className="table-empty-row">
                    <td colSpan={6}>
                      <div className="table-empty-content">
                        <span className="table-empty-icon">🎫</span>
                        <span className="table-empty-text">
                          {error ? 'Could not load tickets.' : 'No tickets found. Try adjusting your search.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  tickets.length > 0 &&
                  tickets.map((t) => (
                    <tr key={t.ticketId}>
                      <td>
                        <span className="table-badge table-badge--slate">#{t.ticketId}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {t.passengerFirstName} {t.passengerLastName}
                      </td>
                      <td>
                        <span className="table-badge table-badge--sky">{t.flightNumber}</span>
                      </td>
                      <td style={{ color: '#475569' }}>
                        {t.flightDate ? new Date(t.flightDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        <span className="route-cell">
                          {t.departureAirportId}
                          <span className="route-arrow">▶</span>
                          {t.arrivalAirportId}
                        </span>
                      </td>
                      <td>
                        <span className="table-badge table-badge--indigo">{t.seat}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

