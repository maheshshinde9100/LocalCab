import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();
  const driverName = localStorage.getItem('driverName');

  const handleLogout = () => {
    auth.logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-black flex items-center gap-2">
              <span className="bg-black text-white px-2 py-0.5 rounded">L</span>
              LocalCab
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <Link to="/driver/dashboard" className="text-sm font-bold text-gray-900 hover:text-black transition-colors">Dashboard</Link>
                <Link to="/developer" className="text-sm font-bold text-gray-900 hover:text-black transition-colors">Developer</Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                    {driverName?.charAt(0) || 'D'}
                  </div>
                  <span className="text-sm font-bold text-black">{driverName || 'Driver'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/" className="text-sm font-bold text-gray-900 hover:text-black transition-colors">Home</Link>
                <Link to="/drivers/available" className="text-sm font-bold text-gray-900 hover:text-black transition-colors">Find Taxi</Link>
                <Link to="/developer" className="text-sm font-bold text-gray-900 hover:text-black transition-colors">Developer</Link>
                <div className="h-6 w-px bg-gray-200"></div>
                <div className="flex items-center gap-4">
                  <Link
                    to="/drivers/register"
                    className="text-sm font-bold text-gray-900 hover:text-black transition-colors"
                  >
                    Ride with us
                  </Link>
                  <Link
                    to="/driver/login"
                    className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                  >
                    Driver Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - simplified for now */}
          <div className="md:hidden flex items-center">
            <Link to="/drivers/available" className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold">Book Now</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
