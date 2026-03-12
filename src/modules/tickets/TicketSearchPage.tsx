import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';

interface TicketSearchCriteria {
  ticketNumber: string;
  lastName: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  passengerName: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  status: string;
}

async function fetchTickets(criteria: TicketSearchCriteria) {
  // Replace '/tickets/search' with your ASP.NET Core endpoint
  const response = await apiClient.get<Ticket[]>('/tickets/search', {
    params: criteria
  });
  return response.data;
}

export function TicketSearchPage() {
  const [criteria, setCriteria] = useState<TicketSearchCriteria>({
    ticketNumber: '',
    lastName: ''
  });
  const [submittedCriteria, setSubmittedCriteria] = useState<TicketSearchCriteria | null>(null);

  const { data: tickets, isFetching } = useQuery({
    queryKey: ['tickets', submittedCriteria],
    queryFn: () => fetchTickets(submittedCriteria as TicketSearchCriteria),
    enabled: !!submittedCriteria
  });

  const onSearch = () => {
    if (!criteria.ticketNumber && !criteria.lastName) return;
    setSubmittedCriteria(criteria);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-blue-700">Ticket search</h1>
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ticket number</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={criteria.ticketNumber}
              onChange={(e) =>
                setCriteria((c) => ({
                  ...c,
                  ticketNumber: e.target.value
                }))
              }
              placeholder="e.g. 123-4567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passenger last name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={criteria.lastName}
              onChange={(e) =>
                setCriteria((c) => ({
                  ...c,
                  lastName: e.target.value
                }))
              }
              placeholder="Optional"
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
        {isFetching && <p>Loading tickets...</p>}
        {!isFetching && tickets && tickets.length === 0 && <p>No tickets found.</p>}
        {!isFetching && tickets && tickets.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Ticket</th>
                <th className="px-3 py-2 text-left">Passenger</th>
                <th className="px-3 py-2 text-left">Flight</th>
                <th className="px-3 py-2 text-left">Route</th>
                <th className="px-3 py-2 text-left">Departure</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2">{t.ticketNumber}</td>
                  <td className="px-3 py-2">{t.passengerName}</td>
                  <td className="px-3 py-2">{t.flightNumber}</td>
                  <td className="px-3 py-2">
                    {t.from} → {t.to}
                  </td>
                  <td className="px-3 py-2">{new Date(t.departureTime).toLocaleString()}</td>
                  <td className="px-3 py-2">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

