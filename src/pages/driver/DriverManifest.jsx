import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI } from '../../api';
import { formatDate, formatTime } from '../../utils';
import { ArrowLeft, Users, CheckCircle, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DriverManifest() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsAPI.getManifest(tripId)
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load manifest'))
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="card animate-pulse h-24" />
        {[1,2,3].map(i => <div key={i} className="card animate-pulse h-16" />)}
      </div>
    );
  }

  const trip = data?.trip;
  const manifest = data?.manifest || [];
  const boarded = manifest.filter(p => p.booking_status === 'BOARDED').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/driver')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl text-dark-900">Passenger Manifest</h1>
          {trip && <p className="text-xs text-slate-400">{formatTime(trip.departure_time)} · {formatDate(trip.travel_date)}</p>}
        </div>
      </div>

      {trip && (
        <div className="bg-dark-800 rounded-2xl p-4 text-white">
          <p className="text-slate-400 text-xs mb-1">Route</p>
          <h2 className="font-bold text-lg">{trip.route_name}</h2>
          <div className="flex gap-4 mt-2 text-sm">
            <div>
              <p className="text-slate-400 text-xs">Departure</p>
              <p className="font-semibold text-brand-400">{formatTime(trip.departure_time)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Booked</p>
              <p className="font-semibold">{manifest.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Boarded</p>
              <p className="font-semibold text-emerald-400">{boarded}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Remaining</p>
              <p className="font-semibold text-amber-400">{manifest.length - boarded}</p>
            </div>
          </div>
        </div>
      )}

      {manifest.length === 0 ? (
        <div className="card text-center py-10">
          <Users size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No confirmed passengers</p>
        </div>
      ) : (
        <div className="space-y-2">
          {manifest.map((p, idx) => (
            <div
              key={p.id}
              className={`card flex items-center gap-3 border ${
                p.booking_status === 'BOARDED'
                  ? 'border-emerald-100 bg-emerald-50/40'
                  : 'border-slate-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                p.booking_status === 'BOARDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-dark-800 text-sm">{p.passenger_name}</p>
                  {p.booking_status === 'BOARDED' && (
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-400">{p.passenger_phone}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={10} />
                  {p.pickup_location} → {p.dropoff_location}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-xs font-bold text-brand-600">{p.booking_code}</p>
                <span className={`text-xs font-semibold ${
                  p.booking_status === 'BOARDED' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {p.booking_status === 'BOARDED' ? 'Boarded' : 'Confirmed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
