import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { driverAPI, riderAPI } from '../utils/api';
import { auth } from '../utils/auth';

function UnifiedRegister() {
  const navigate = useNavigate();
  const [role, setRole] = useState('customer'); // 'customer' or 'driver'
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    village: '',
    pincode: '',
    // Driver specific
    vehicleType: 'Sedan',
    vehicleNumber: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'driver') {
        await driverAPI.register({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          village: formData.village,
          pincode: formData.pincode,
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber,
        });
        navigate('/login');
      } else {
        const res = await riderAPI.register({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          village: formData.village,
          pincode: formData.pincode,
        });
        auth.setRiderSessionToken(res.data.token, res.data.rider);
        navigate('/rider/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-4xl font-black tracking-tight text-black">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 font-medium">
          Join LocalCab today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-2xl border border-gray-100 rounded-[2.5rem] sm:px-10">
          
          {/* Role Toggle */}
          <div className="flex bg-gray-50 p-1 rounded-2xl mb-8">
            <button
              onClick={() => setRole('customer')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'customer' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
            >
              I want to ride
            </button>
            <button
              onClick={() => setRole('driver')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'driver' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}
            >
              I want to drive
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-black font-medium text-black" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                <input name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-black font-medium text-black" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Village / City</label>
                <input name="village" required value={formData.village} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-black font-medium text-black" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Pincode</label>
                <input name="pincode" required value={formData.pincode} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-black font-medium text-black" />
              </div>
            </div>

            {role === 'driver' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Vehicle Type</label>
                  <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-black font-medium text-black appearance-none">
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Auto</option>
                    <option>Hatchback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Vehicle Number</label>
                  <input name="vehicleNumber" required={role === 'driver'} value={formData.vehicleNumber} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-black font-medium text-black placeholder-gray-400" placeholder="e.g. MH15AB1234" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
              <input name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-black font-medium text-black" />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-black text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all active:scale-95">
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedRegister;
