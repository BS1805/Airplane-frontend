import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';

interface FlightSearchCriteria {
  from: string;
  to: string;
  date: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

async function fetchFlights(criteria: FlightSearchCriteria) {
  // Replace '/flights/search' with your ASP.NET Core endpoint
  const response = await apiClient.get<Flight[]>('/flights/search', {
    params: criteria
  });
  return response.data;
}

export function FlightSearchPage() {
  const [criteria, setCriteria] = useState<FlightSearchCriteria>({
    from: '',
    to: '',
    date: ''
  });
  const [submittedCriteria, setSubmittedCriteria] = useState<FlightSearchCriteria | null>(null);

  const { data: flights, isFetching } = useQuery({
    queryKey: ['flights', submittedCriteria],
    queryFn: () => fetchFlights(submittedCriteria as FlightSearchCriteria),
    enabled: !!submittedCriteria
  });

  const onSearch = () => {
    if (!criteria.from || !criteria.to || !criteria.date) return;
    setSubmittedCriteria(criteria);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-blue-700">Flight search</h1>
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={criteria.from}
              onChange={(e) => setCriteria((c) => ({ ...c, from: e.target.value }))}
              placeholder="City or airport code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={criteria.to}
              onChange={(e) => setCriteria((c) => ({ ...c, to: e.target.value }))}
              placeholder="City or airport code"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={criteria.date}
              onChange={(e) => setCriteria((c) => ({ ...c, date: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={onSearch}
              className="w-full rounded bg-blue-600 text-white py-2 font-medium hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Results</h2>
        {isFetching && <p>Loading flights...</p>}
        {!isFetching && flights && flights.length === 0 && <p>No flights found.</p>}
        {!isFetching && flights && flights.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Flight</th>
                <th className="px-3 py-2 text-left">Route</th>
                <th className="px-3 py-2 text-left">Departure</th>
                <th className="px-3 py-2 text-left">Arrival</th>
                <th className="px-3 py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id} className="border-t">
                  <td className="px-3 py-2">{f.flightNumber}</td>
                  <td className="px-3 py-2">
                    {f.from} → {f.to}
                  </td>
                  <td className="px-3 py-2">{new Date(f.departureTime).toLocaleString()}</td>
                  <td className="px-3 py-2">{new Date(f.arrivalTime).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">${f.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

