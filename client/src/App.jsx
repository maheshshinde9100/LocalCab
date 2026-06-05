import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth } from './utils/auth';
import Home from './pages/Home';
import UnifiedRegister from './pages/UnifiedRegister';
import UnifiedLogin from './pages/UnifiedLogin';
import BookingTracking from './pages/BookingTracking';
import DriverDashboard from './pages/DriverDashboard';
import AvailableDrivers from './pages/AvailableDrivers';
import CreateBooking from './pages/CreateBooking';
import RateDriver from './pages/RateDriver';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Developer from './pages/Developer';
import NotFound from './pages/NotFound';
import RiderDashboard from './pages/RiderDashboard';
import ScrollToTop from './utils/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function ProtectedRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/login" />;
}

function RiderProtectedRoute({ children }) {
  return auth.isRiderAuthenticated() ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  return auth.isAdminAuthenticated() ? children : <Navigate to="/admin/login" />;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white">
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<UnifiedRegister />} />
            <Route path="/login" element={<UnifiedLogin />} />
            <Route path="/drivers/available" element={<AvailableDrivers />} />
            <Route path="/bookings/create" element={<CreateBooking />} />
            <Route path="/track/:bookingId" element={<BookingTracking />} />
            <Route path="/ratings/create" element={<RateDriver />} />
            <Route path="/developer" element={<Developer />} />
            
            {/* Rider Routes */}
            <Route
              path="/rider/dashboard"
              element={
                <RiderProtectedRoute>
                  <RiderDashboard />
                </RiderProtectedRoute>
              }
            />

            <Route
              path="/driver/dashboard"
              element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
