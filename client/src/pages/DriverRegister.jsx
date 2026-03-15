import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { driverAPI } from '../utils/api';

function DriverRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    village: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    vehicleType: 'Sedan',
    vehicleModel: '',
    vehicleNumber: '',
    totalSeats: '4',
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
      await driverAPI.register({
        ...formData,
        totalSeats: formData.totalSeats ? parseInt(formData.totalSeats) : undefined,
      });
      alert('Welcome to the fleet! Please log in to start.');
      navigate('/driver/login');
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        const fieldMsgs = Object.values(err.response.data.fieldErrors).join(', ');
        setError(`Validation Error: ${fieldMsgs}`);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Check all fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-20">
      <div className="w-full max-w-4xl opacity-0 animate-fade-in-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white text-3xl font-black rounded-2xl mb-6 shadow-2xl">L</div>
          <h1 className="text-4xl font-black tracking-tight text-black">Drive and Earn</h1>
          <p className="text-gray-400 font-medium mt-2 max-w-md mx-auto">Join the most reliable rural taxi network in India. Fill in your details below.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
          <div className="md:grid md:grid-cols-12">
            {/* Sidebar Info */}
            <div className="md:col-span-4 bg-black p-12 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-6">Why drive with us?</h2>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                    <p className="text-sm text-gray-400 leading-relaxed"><span className="text-white font-bold">Flexible hours.</span> You decide when you want to take rides.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                    <p className="text-sm text-gray-400 leading-relaxed"><span className="text-white font-bold">Fast payments.</span> Get paid directly by your passengers.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">✓</div>
                    <p className="text-sm text-gray-400 leading-relaxed"><span className="text-white font-bold">Community.</span> Help your local village stay connected.</p>
                  </li>
                </ul>
              </div>
              <div className="mt-20 pt-10 border-t border-white/10">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest leading-loose">Already have an account?</p>
                <Link to="/driver/login" className="text-white font-black hover:underline">Sign In Instead</Link>
              </div>
            </div>

            {/* Form Content */}
            <div className="md:col-span-8 p-12 lg:p-16 bg-white">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl">
                  <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-10 text-left">
                {/* Basic Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Personal Information</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" placeholder="Mahesh Shinde" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                      <input name="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" placeholder="9876543210" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Set Password</label>
                    <input name="password" type="password" required minLength={6} value={formData.password} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" placeholder="Min. 6 characters" />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Vehicle Specification</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vehicle Type</label>
                      <select name="vehicleType" required value={formData.vehicleType} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all appearance-none cursor-pointer">
                        <option>Hatchback</option>
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Auto</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Model Name</label>
                      <input name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" placeholder="e.g. Maruti Swift" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plate Number</label>
                      <input name="vehicleNumber" required value={formData.vehicleNumber} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" placeholder="MH 12 AB 1234" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Seats</label>
                      <input name="totalSeats" type="number" min="1" value={formData.totalSeats} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" />
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Operating Area</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pincode</label>
                      <input name="pincode" required pattern="[0-9]{6}" maxLength={6} value={formData.pincode} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" placeholder="411001" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Village/Town</label>
                      <input name="village" required value={formData.village} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 focus:ring-2 focus:ring-black font-bold transition-all" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-5 rounded-2xl text-lg font-black hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : 'GET STARTED'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverRegister;
