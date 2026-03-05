import { Link } from 'react-router-dom';

const DriverCard = ({ driver, ratingSummary }) => {
  return (
    <div className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-black transition-all duration-500 hover:shadow-[0_24px_48px_-15px_rgba(0,0,0,0.08)]">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-xl font-black text-black group-hover:bg-black group-hover:text-white transition-colors duration-500">
            {driver.fullName.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-black">{driver.fullName}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{driver.village}</p>
          </div>
        </div>

        {ratingSummary && ratingSummary.totalRatings > 0 && (
          <div className="bg-gray-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="text-black text-sm font-black">{ratingSummary.averageRating.toFixed(1)}</span>
            <span className="text-black text-xs">★</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Vehicle</p>
          <p className="text-sm font-bold text-black truncate">{driver.vehicleModel || driver.vehicleType}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Capacity</p>
          <p className="text-sm font-bold text-black">{driver.totalSeats || '4'} Persons</p>
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href={`tel:${driver.phoneNumber}`}
          className="flex-1 bg-gray-50 text-black text-center font-black py-4 rounded-2xl text-xs hover:bg-black hover:text-white transition-all active:scale-95"
        >
          CALL NOW
        </a>
        <Link
          to={`/bookings/create?driverId=${driver.id}`}
          className="flex-1 bg-black text-white text-center font-black py-4 rounded-2xl text-xs hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/10"
        >
          BOOK RIDE
        </Link>
      </div>
    </div>
  );
};

export default DriverCard;
