import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './utils/auth';
import Home from './pages/Home';
import DriverRegister from './pages/DriverRegister';
import DriverLogin from './pages/DriverLogin';
import DriverDashboard from './pages/DriverDashboard';
import AvailableDrivers from './pages/AvailableDrivers';
import CreateBooking from './pages/CreateBooking';
import RateDriver from './pages/RateDriver';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/driver/login" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drivers/register" element={<DriverRegister />} />
          <Route path="/driver/login" element={<DriverLogin />} />
          <Route path="/drivers/available" element={<AvailableDrivers />} />
          <Route path="/bookings/create" element={<CreateBooking />} />
          <Route path="/ratings/create" element={<RateDriver />} />
          <Route
            path="/driver/dashboard"
            element={
              <ProtectedRoute>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
