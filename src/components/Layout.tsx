import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/AuthContext';

export function Layout() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-700';

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-xl font-semibold text-blue-700">Airplane Booking</span>
          <nav className="flex items-center gap-4">
            <Link to="/flights" className={`px-2 py-1 ${isActive('/flights')}`}>
              Flights
            </Link>
            <Link to="/tickets" className={`px-2 py-1 ${isActive('/tickets')}`}>
              Tickets
            </Link>
            <button
              onClick={logout}
              className="ml-4 rounded bg-red-500 text-white px-3 py-1 text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

