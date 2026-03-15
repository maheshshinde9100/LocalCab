import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Hardcoded admin for demo/initial setup
    // In a real app, this would be an API call
    if (formData.username === 'admin' && formData.password === 'admin123') {
      auth.setAdminToken('mock-admin-jwt-token');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4 py-20">
      <div className="w-full max-w-[400px] opacity-0 animate-fade-in-up">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white text-black text-3xl font-black rounded-2xl mb-6 shadow-2xl">A</div>
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Portal</h1>
          <p className="text-gray-400 font-medium mt-2">Secure access for platform management</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl">
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-black font-bold outline-none"
                placeholder="Admin username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-black font-bold outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-2xl text-lg font-black hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl mt-4"
            >
              LOG IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
