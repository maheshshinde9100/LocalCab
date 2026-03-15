import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../utils/auth';
import { bookingAPI, aiAPI } from '../utils/api';

function CreateBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const driverIdFromUrl = searchParams.get('driverId');

  const rider = auth.getRiderDetails();

  const [formData, setFormData] = useState({
    driverId: driverIdFromUrl || '',
    riderName: rider.name || '',
    riderPhoneNumber: rider.phone || '',
    pickupVillage: '',
    pickupLandmark: '',
    dropLocation: '',
    agreedFare: '',
    vehicleType: 'Sedan', // Default
    approximateKm: 10,
  });

  const [showLogin, setShowLogin] = useState(!auth.isRiderAuthenticated());

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const getAiFareSuggestion = async () => {
    if (!formData.pickupVillage || !formData.dropLocation) {
      setError('Please enter pickup and drop locations first');
      return;
    }
    setAiLoading(true);
    setError('');
    try {
      const response = await aiAPI.suggestFare({
        pickupVillage: formData.pickupVillage,
        dropLocation: formData.dropLocation,
        vehicleType: formData.vehicleType,
        approximateKm: formData.approximateKm
      });
      setAiSuggestion(response.data);
    } catch (err) {
      setError('AI service temporarily unavailable. Fallback to manual fare.');
    } finally {
      setAiLoading(false);
    }
  };

  const applySuggestion = () => {
    if (aiSuggestion) {
      setFormData({ ...formData, agreedFare: aiSuggestion.suggestedMinFare });
    }
  };

  const handleRiderLogin = (e) => {
    e.preventDefault();
    if (formData.riderName && formData.riderPhoneNumber) {
      auth.setRiderSession(formData.riderName, formData.riderPhoneNumber);
      setShowLogin(false);
    } else {
      setError('Please enter your name and phone number to continue');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreedFare) {
      setError('Please set the agreed fare');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await bookingAPI.create({
        ...formData,
        agreedFare: parseFloat(formData.agreedFare),
      });
      alert('Ride booked! The driver has been notified.');
      navigate('/');
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        const fieldMsgs = Object.values(err.response.data.fieldErrors).join(', ');
        setError(`Details missing: ${fieldMsgs}`);
      } else {
        setError(err.response?.data?.message || 'Booking failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Visual Header */}
      <div className="bg-uber-black h-48 flex items-center justify-center">
        <div className="text-center opacity-0 animate-fade-in">
          <h1 className="text-white text-3xl sm:text-4xl font-black">Plan your ride</h1>
          <p className="text-gray-400 mt-2">Reliable travel for rural India</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 pb-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden opacity-0 animate-fade-in-up">
          <div className="md:grid md:grid-cols-5">

            {/* Left Column: Form */}
            <div className="md:col-span-3 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-gray-100">
              <h2 className="text-2xl font-bold text-black mb-8">Ride Details</h2>

              {showLogin ? (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-sm text-gray-600 font-medium mb-4">Please identify yourself to book a ride. We'll remember you for next time.</p>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Full Name</label>
                        <input
                          name="riderName"
                          required
                          value={formData.riderName}
                          onChange={handleChange}
                          placeholder="Mahesh Shinde"
                          className="w-full bg-white border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-black font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                        <input
                          name="riderPhoneNumber"
                          type="tel"
                          required
                          value={formData.riderPhoneNumber}
                          onChange={handleChange}
                          placeholder="9876543210"
                          className="w-full bg-white border border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-black font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRiderLogin}
                    className="w-full bg-black text-white py-5 rounded-2xl text-lg font-black hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
                  >
                    CONTINUE TO BOOKING
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                        {formData.riderName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Booking as</p>
                        <p className="text-sm font-black text-black">{formData.riderName}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLogin(true)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pickup Village</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black"></div>
                        <input name="pickupVillage" required value={formData.pickupVillage} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black font-medium" placeholder="E.g. Shivajinagar" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Drop Point</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 border-2 border-black"></div>
                        <input name="dropLocation" required value={formData.dropLocation} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black font-medium" placeholder="E.g. Bus Stand, City Center" />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Vehicle Type</label>
                      <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-black font-medium appearance-none">
                        <option>Sedan</option>
                        <option>SUV</option>
                        <option>Auto</option>
                        <option>Hatchback</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Approx KM</label>
                      <input name="approximateKm" type="number" value={formData.approximateKm} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 focus:ring-2 focus:ring-black font-medium" />
                    </div>
                  </div>

                  <div className="pt-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Agreed Fare (₹)</label>
                    <div className="mt-2 flex gap-3">
                      <input name="agreedFare" type="number" required value={formData.agreedFare} onChange={handleChange} className="flex-1 bg-black text-white text-2xl font-black rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gray-700 outline-none" placeholder="0.00" />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Finalize the price with the driver before booking.</p>
                  </div>

                  {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-2xl">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl text-lg font-black hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl mt-4">
                    {loading ? 'Confirming...' : 'CONFIRM BOOKING'}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: AI Assistant */}
            <div className="md:col-span-2 bg-gray-50 p-8 sm:p-12">
              <div className="sticky top-12">
                <div className="bg-black text-white rounded-3xl p-6 shadow-2xl overflow-hidden relative group">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-150 transition-transform"></div>
                  <h3 className="text-xl font-bold mb-2">Smart Assist</h3>
                  <p className="text-gray-400 text-sm mb-6 font-medium leading-relaxed">Let our AI suggest a fair price based on typical rural rates and distances.</p>

                  <button onClick={getAiFareSuggestion} disabled={aiLoading} className="w-full bg-white text-black py-4 rounded-xl font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    {aiLoading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : 'SUGGEST FARE'}
                  </button>
                </div>

                {aiSuggestion && (
                  <div className="mt-6 animate-fade-in">
                    <div className="bg-white border-2 border-black rounded-[2rem] p-6 shadow-xl">
                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-4">AI Recommended Range</p>
                      <div className="flex items-end justify-between mb-6">
                        <div className="text-3xl font-black tracking-tighter">
                          ₹{aiSuggestion.suggestedMinFare} - {aiSuggestion.suggestedMaxFare}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl mb-6">
                        <p className="text-xs font-bold text-gray-900 leading-relaxed italic">"{aiSuggestion.tip}"</p>
                      </div>
                      <button onClick={applySuggestion} className="w-full border-2 border-black text-black py-3 rounded-xl font-black text-xs hover:bg-black hover:text-white transition-all">
                        USE MINIMUM FARE
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100">
                  <h4 className="text-yellow-800 font-bold text-xs uppercase mb-2">Notice</h4>
                  <p className="text-yellow-700 text-[11px] font-medium">LocalCab only facilitates connections. All payments are handled directly between rider and driver.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateBooking;
