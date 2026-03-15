import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './utils/auth';
import Home from './pages/Home';
import DriverRegister from './pages/DriverRegister';
import DriverLogin from './pages/DriverLogin';
import DriverDashboard from './pages/DriverDashboard';
import AvailableDrivers from './pages/AvailableDrivers';
import CreateBooking from './pages/CreateBooking';
import RateDriver from './pages/RateDriver';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Developer from './pages/Developer';
import NotFound from './pages/NotFound';
import ScrollToTop from './utils/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function ProtectedRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/driver/login" />;
}

function AdminRoute({ children }) {
  return auth.isAdminAuthenticated() ? children : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/drivers/register" element={<DriverRegister />} />
            <Route path="/driver/login" element={<DriverLogin />} />
            <Route path="/drivers/available" element={<AvailableDrivers />} />
            <Route path="/bookings/create" element={<CreateBooking />} />
            <Route path="/ratings/create" element={<RateDriver />} />
            <Route path="/developer" element={<Developer />} />
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
        <Footer />
      </div>
    </Router>
  );
}

export default App;
