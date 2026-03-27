import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../auth/AuthContext';

// Matches the ASP.NET Core query parameter names from Swagger
interface FlightSearchQueryParams {
  FlightNumber?: string;
  FlightDate?: string;
  DepartureAirportId?: number;
  ArrivalAirportId?: number;
  PageNumber: number;
  PageSize: number;
}

// UI state for the form
interface FlightSearchFormState {
  flightNumber: string;
  flightDate: string;
  departureAirportId: string;
  arrivalAirportId: string;
}

// Shape of a single flight item
interface Flight {
  flightId: number;
  flightNumber: string;
  flightDate: string;
  departureTime: string;
  arrivalTime: string;
  departureAirportId: number;
  arrivalAirportId: number;
  totalPassengers: number;
  totalBaggage?: number;
}

// Generic wrapper based on your Swagger response
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

async function fetchFlights(params: FlightSearchQueryParams) {
  const response = await apiClient.get<PagedResponse<Flight>>('/api/Flights/search', {
    params
  });

  return response.data.data.items;
}

export function FlightSearchPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [form, setForm] = useState<FlightSearchFormState>({
    flightNumber: '',
    flightDate: '',
    departureAirportId: '',
    arrivalAirportId: ''
  });

  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async () => {
    // Build params using backend names and defaults for paging
    const params: FlightSearchQueryParams = {
      PageNumber: 1,
      PageSize: 10
    };

    if (form.flightNumber.trim()) {
      params.FlightNumber = form.flightNumber.trim();
    }

    if (form.flightDate) {
      params.FlightDate = form.flightDate;
    }

    if (form.departureAirportId.trim()) {
      params.DepartureAirportId = Number(form.departureAirportId);
    }

    if (form.arrivalAirportId.trim()) {
      params.ArrivalAirportId = Number(form.arrivalAirportId);
    }

    try {
      setLoading(true);
      setError(null);
      const items = await fetchFlights(params);
      setFlights(items);
    } catch (e) {
      setError('Could not load flights.');
      setFlights([]);
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
              Search<span> Flight</span>
            </div>

            <div className="flight-search-form">
              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">departure airport id</div>
                  <input
                    type="number"
                    className="flight-search-input"
                    value={form.departureAirportId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        departureAirportId: e.target.value
                      }))
                    }
                    placeholder="e.g. 1"
                  />
                </div>

                <div>
                  <div className="flight-search-label">arrival airport id</div>
                  <input
                    type="number"
                    className="flight-search-input"
                    value={form.arrivalAirportId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        arrivalAirportId: e.target.value
                      }))
                    }
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              <div className="flight-search-row">
                <div>
                  <div className="flight-search-label">Departure date</div>
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

                <div>
                  <div className="flight-search-label">Flight Number</div>
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
              </div>

              <button type="button" onClick={onSearch} className="flight-search-button">
                Search
              </button>
            </div>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="results-header">
            <h2 className="auth-title">Results</h2>
            {!loading && flights.length > 0 && (
              <span className="results-count-badge">{flights.length} flight{flights.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Passengers</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr className="table-loading-row">
                    <td colSpan={6}>
                      <div className="table-loading-content">
                        <span className="table-spinner" />
                        Loading flights…
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && flights.length === 0 && (
                  <tr className="table-empty-row">
                    <td colSpan={6}>
                      <div className="table-empty-content">
                        <span className="table-empty-icon">✈️</span>
                        <span className="table-empty-text">
                          {error ? 'Could not load flights.' : 'No flights found. Try adjusting your search.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading &&
                  flights.length > 0 &&
                  flights.map((f) => (
                    <tr key={f.flightId}>
                      <td>
                        <span className="table-badge table-badge--sky">{f.flightNumber}</span>
                      </td>
                      <td style={{ color: '#475569' }}>
                        {f.flightDate ? new Date(f.flightDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        <span className="route-cell">
                          {f.departureAirportId}
                          <span className="route-arrow">▶</span>
                          {f.arrivalAirportId}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{f.departureTime || '—'}</td>
                      <td style={{ fontWeight: 500 }}>{f.arrivalTime || '—'}</td>
                      <td>
                        <span className="table-badge table-badge--indigo">{f.totalPassengers}</span>
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

