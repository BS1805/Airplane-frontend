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
              Search<span> Ticket</span>
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
                Search
              </button>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="mb-4">
            <h2 className="auth-title">Results</h2>
          </div>

          <div className="results-table-wrapper">
            <table className="results-table text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left">Ticket</th>
                  <th className="px-3 py-2 text-left">Passenger</th>
                  <th className="px-3 py-2 text-left">Flight</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Route</th>
                  <th className="px-3 py-2 text-left">Seat</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="px-3 py-3 text-sm text-slate-500" colSpan={6}>
                      Loading tickets…
                    </td>
                  </tr>
                )}
                {!loading && (error || tickets.length === 0) && (
                  <tr>
                    <td className="px-3 py-3 text-sm text-slate-500" colSpan={6}>
                      No tickets found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  tickets.length > 0 &&
                  tickets.map((t) => (
                    <tr key={t.ticketId} className="border-t">
                      <td className="px-3 py-2">{t.ticketId}</td>
                      <td className="px-3 py-2">
                        {t.passengerFirstName} {t.passengerLastName}
                      </td>
                      <td className="px-3 py-2">{t.flightNumber}</td>
                      <td className="px-3 py-2">
                        {t.flightDate ? new Date(t.flightDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-3 py-2">
                        {t.departureAirportId} → {t.arrivalAirportId}
                      </td>
                      <td className="px-3 py-2">{t.seat}</td>
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

