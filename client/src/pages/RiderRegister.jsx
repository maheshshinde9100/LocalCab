import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riderAPI } from '../utils/api';
import { auth } from '../utils/auth';

function RiderRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    email: '',
    village: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await riderAPI.register(formData);
      auth.setRiderToken(response.data.token);
      auth.setRiderId(response.data.rider.id);
      auth.setRiderDetails(response.data.rider.fullName, response.data.rider.phoneNumber);
      navigate('/rider/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create Rider Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/rider/login" className="font-medium text-blue-600 hover:text-blue-500">
              login to your existing account
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="sr-only">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email (Optional)</label>
              <input
                id="email"
                name="email"
                type="email"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email (Optional)"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="village" className="sr-only">Village</label>
              <input
                id="village"
                name="village"
                type="text"
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Village"
                value={formData.village}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="taluka" className="sr-only">Taluka</label>
                <input
                  id="taluka"
                  name="taluka"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Taluka"
                  value={formData.taluka}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="district" className="sr-only">District</label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="sr-only">State</label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="pincode" className="sr-only">Pincode</label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RiderRegister;
