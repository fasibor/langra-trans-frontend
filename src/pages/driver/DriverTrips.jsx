import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tripsAPI } from '../../api';
import { formatTime, formatCurrency } from '../../utils';
import { Truck, Users, CheckCircle, ScanLine, Clock } from 'lucide-react';

export default function DriverTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsAPI.getDriverTrips()
      .then(res => setTrips(res.data.trips))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-slate-400 text-sm">{today}</p>
        <h1 className="font-display font-bold text-2xl text-dark-900">Today's Trips</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="card animate-pulse h-40" />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={28} className="text-slate-400" />
          </div>
          <h3 className="font-semibold text-dark-800 mb-1">No trips assigned</h3>
          <p className="text-slate-400 text-sm">
            You have no trips scheduled for today. Check back later or contact admin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => {
            const totalPassengers = parseInt(trip.confirmed_count || 0) + parseInt(trip.boarded_count || 0);
            const boardedCount = parseInt(trip.boarded_count || 0);
            const confirmedCount = parseInt(trip.confirmed_count || 0);
            const boardedPct = totalPassengers > 0 ? Math.round((boardedCount / totalPassengers) * 100) : 0;

            return (
              <div key={trip.id} className="card">
                {/* Route & time */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={22} className="text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-dark-800 text-lg">{trip.route_name}</h2>
                    <p className="text-brand-600 font-semibold">{formatTime(trip.departure_time)}</p>
                    <p className="text-slate-400 text-sm">{formatCurrency(trip.fare)} per passenger</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    trip.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    trip.status === 'full' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {trip.status.toUpperCase()}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center bg-slate-50 rounded-xl py-3">
                    <p className="text-2xl font-display font-bold text-dark-800">{trip.capacity - trip.available_seats}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Booked</p>
                  </div>
                  <div className="text-center bg-emerald-50 rounded-xl py-3">
                    <p className="text-2xl font-display font-bold text-emerald-700">{boardedCount}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Boarded</p>
                  </div>
                  <div className="text-center bg-amber-50 rounded-xl py-3">
                    <p className="text-2xl font-display font-bold text-amber-700">{confirmedCount}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Remaining</p>
                  </div>
                </div>

                {/* Progress bar */}
                {totalPassengers > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Boarding progress</span>
                      <span>{boardedCount}/{totalPassengers} ({boardedPct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${boardedPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/driver/manifest/${trip.id}`}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
                  >
                    <Users size={16} />
                    View Manifest
                  </Link>
                  <Link
                    to="/driver/validate"
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
                  >
                    <ScanLine size={16} />
                    Scan / Validate
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick validate card */}
      {!loading && trips.length > 0 && (
        <div className="bg-dark-800 rounded-2xl p-5 text-center">
          <ScanLine size={28} className="text-brand-400 mx-auto mb-2" />
          <h3 className="font-semibold text-white mb-1">Ready to board passengers?</h3>
          <p className="text-slate-400 text-sm mb-4">Enter booking codes or scan QR tickets</p>
          <Link to="/driver/validate" className="btn-primary w-full flex items-center justify-center gap-2">
            <ScanLine size={18} /> Open Validator
          </Link>
        </div>
      )}
    </div>
  );
}
