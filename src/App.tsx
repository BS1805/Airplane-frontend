import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './modules/auth/AuthContext';
import { LoginPage } from './modules/auth/LoginPage';
import { FlightSearchPage } from './modules/flights/FlightSearchPage';
import { TicketSearchPage } from './modules/tickets/TicketSearchPage';
import { Layout } from './components/Layout';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/flights" replace />} />
        <Route path="flights" element={<FlightSearchPage />} />
        <Route path="tickets" element={<TicketSearchPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

