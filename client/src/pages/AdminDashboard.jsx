import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import { auth } from '../utils/auth';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers', 'bookings', 'riders', 'inbox'
  const [drivers, setDrivers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [riders, setRiders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [driversRes, bookingsRes, ridersRes, statsRes] = await Promise.all([
        adminAPI.getDrivers(),
        adminAPI.getBookings(),
        adminAPI.getRiders(),
        adminAPI.getStats()
      ]);
      setDrivers(driversRes.data);
      setBookings(bookingsRes.data);
      setRiders(ridersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDriver = async (id) => {
    try {
      await adminAPI.blockDriver(id);
      loadData();
    } catch (err) { alert('Failed to block driver'); }
  };

  const handleUnblockDriver = async (id) => {
    try {
      await adminAPI.unblockDriver(id);
      loadData();
    } catch (err) { alert('Failed to unblock driver'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white flex flex-col p-8 sticky top-0 h-screen">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black rounded-xl">A</div>
            <span className="font-black tracking-tighter text-xl">Admin Panel</span>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-1">
            {localStorage.getItem('adminUsername') || 'System Admin'}
          </p>
        </div>

        <nav className="flex-1 space-y-4">
          {['drivers', 'bookings', 'riders', 'inbox'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl ring-4 ring-gray-800' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button
          onClick={() => { auth.logout(); window.location.href = '/admin/login'; }}
          className="text-red-500 font-bold uppercase tracking-widest text-[10px] hover:text-red-400 transition-colors pt-8 border-t border-white/10"
        >
          Logout Session
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-black capitalize">{activeTab} Management</h1>
            <p className="text-gray-400 font-medium mt-1">Platform overview and controls</p>
          </div>
          {stats && (
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Drivers</p>
                <p className="text-2xl font-black">{stats.totalDrivers}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bookings</p>
                <p className="text-2xl font-black">{stats.totalBookings}</p>
              </div>
            </div>
          )}
        </header>

        {loading ? (
          <div className="bg-white rounded-[2.5rem] p-20 shadow-xl border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Fetching Master Data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
            {activeTab === 'drivers' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Driver Details</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vehicle</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-sm">
                    {drivers.map((driver) => (
                      <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black text-black">{driver.fullName}</p>
                          <p className="text-xs text-gray-400">{driver.phoneNumber}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-black">{driver.village}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{driver.pincode}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-black">{driver.vehicleModel}</p>
                          <p className="text-[10px] text-gray-400 font-bold italic">{driver.vehicleNumber}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${driver.verified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {driver.verified ? 'VERIFIED' : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {driver.verified ? (
                            <button onClick={() => handleBlockDriver(driver.id)} className="text-red-500 font-black hover:underline">Block</button>
                          ) : (
                            <button onClick={() => handleUnblockDriver(driver.id)} className="text-green-600 font-black hover:underline">Verify</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rider</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Journey</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fare</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-sm">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black text-black">{booking.riderName}</p>
                        </td>
                        <td className="px-8 py-6 text-xs">
                          <p className="text-black font-bold">{booking.pickupVillage} → {booking.dropLocation}</p>
                        </td>
                        <td className="px-8 py-6 font-black text-black">₹{booking.agreedFare}</td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'riders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rider Name</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Phone Number</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Lifetime Rides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium text-sm">
                    {riders.map((rider, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black text-black">{rider.riderName}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-black">{rider.riderPhoneNumber}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-black">{rider.totalBookings}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'inbox' && (
              <div className="p-12">
                <div className="max-w-xl">
                  <h3 className="text-xl font-bold mb-8">Verification Requests</h3>
                  <div className="space-y-4">
                    {drivers.filter(d => !d.verified).length === 0 ? (
                      <p className="text-gray-400 italic">No pending notifications</p>
                    ) : (
                      drivers.filter(d => !d.verified).map(d => (
                        <div key={d.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex justify-between items-center group hover:bg-black hover:text-white transition-all cursor-pointer">
                          <div>
                            <p className="font-black uppercase tracking-widest text-[10px] text-gray-400 group-hover:text-gray-500 mb-1">New Driver Registered</p>
                            <p className="font-bold text-lg">{d.fullName} from {d.village}</p>
                          </div>
                          <button onClick={() => handleUnblockDriver(d.id)} className="bg-white text-black p-3 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
