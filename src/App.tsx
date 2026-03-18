import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './modules/auth/AuthContext';
import { LoginPage } from './modules/auth/LoginPage';
import { FlightSearchPage } from './modules/flights/FlightSearchPage';
import { TicketSearchPage } from './modules/tickets/TicketSearchPage';
import { SalesPreviewPage } from './modules/sales/SalesPreviewPage';
import { SalesConfirmPage } from './modules/sales/SalesConfirmPage';
import { PassengerImportPage } from './modules/passengers/PassengerImportPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';

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
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/flights"
        element={
          <PrivateRoute>
            <FlightSearchPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <TicketSearchPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <SalesPreviewPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales/confirm"
        element={
          <PrivateRoute>
            <SalesConfirmPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/passengers/import"
        element={
          <PrivateRoute>
            <PassengerImportPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

