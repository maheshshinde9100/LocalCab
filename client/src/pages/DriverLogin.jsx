import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { driverAPI } from '../utils/api';
import { auth } from '../utils/auth';

function DriverLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await driverAPI.login(formData);
      auth.setToken(response.data.token);
      auth.setDriverId(response.data.driverId);
      localStorage.setItem('driverName', response.data.fullName);
      localStorage.setItem('driverPhone', response.data.phoneNumber);
      navigate('/driver/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-20">
      <div className="w-full max-w-[440px] opacity-0 animate-fade-in-up">
        {/* Brand/Logo Placeholder */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white text-3xl font-black rounded-2xl mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">L</div>
          <h1 className="text-3xl font-black tracking-tight text-black">Welcome back</h1>
          <p className="text-gray-400 font-medium mt-2">Log in to your driver account to start earning</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl animate-fade-in">
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-black font-bold text-lg transition-all"
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                <a href="#" className="text-[10px] font-bold text-black uppercase tracking-widest hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-black font-bold text-lg transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-2xl text-lg font-black hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-2xl mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>SIGNING IN...</span>
                </div>
              ) : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-gray-50 text-center">
            <p className="text-gray-400 font-medium text-sm">
              New to LocalCab?{' '}
              <Link to="/drivers/register" className="text-black font-black hover:underline ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverLogin;
