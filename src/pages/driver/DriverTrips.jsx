import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tripsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { formatTime, formatCurrency, getErrorMessage } from '../../utils';
import { CardSkeleton, ErrorState, Modal } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { Bus, Users, CheckCircle, ChevronRight, RefreshCw, Bell } from 'lucide-react';

export default function DriverTrips() {
  const [arrivalModal, setArrivalModal]   = useState(null);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [signalling, setSignalling]         = useState(false);

  const { data, loading, error, refetch } = useAsync(() => tripsAPI.getDriverTrips(), []);
  const trips = data?.trips || [];

  const openArrivalModal = (trip) => {
    const pickups = trip.pickup_locations || [];
    setArrivalModal({ trip, pickups });
    setSelectedPickup(pickups[0] || '');
  };

  const handleSignalArrival = async () => {
    if (!arrivalModal || !selectedPickup) return;
    setSignalling(true);
    try {
      const res = await tripsAPI.signalArrival(arrivalModal.trip.id, { pickup_location: selectedPickup });
      toast.success(res.data.message);
      setArrivalModal(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSignalling(false);
    }
  };

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display font-bold text-2xl text-white">Today's Trips</h1>
        <p className="text-slate-400 text-sm mt-0.5">{today}</p>
      </div>

      {loading ? <CardSkeleton count={2} height="h-48" />
      : error ? <ErrorState message="Failed to load trips." onRetry={refetch} />
      : trips.length === 0 ? (
        <div className="bg-dark-700 rounded-2xl p-10 text-center">
          <Bus size={32} className="text-slate-500 mx-auto mb-3" />
          <p className="text-white font-semibold">No trips assigned today</p>
          <p className="text-slate-400 text-sm mt-1">Check back later or contact your dispatcher</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => {
            const confirmed = parseInt(trip.confirmed_count || 0);
            const boarded   = parseInt(trip.boarded_count  || 0);
            const remaining = confirmed - boarded;
            const progress  = confirmed > 0 ? (boarded / confirmed) * 100 : 0;

            return (
              <div key={trip.id} className="bg-dark-700 rounded-2xl p-5 border border-dark-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-display font-bold text-white text-lg">{trip.route_name}</p>
                    <p className="text-brand-400 font-semibold text-sm mt-0.5">{formatTime(trip.departure_time)}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    trip.status === 'active' ? 'bg-emerald-400/20 text-emerald-300' :
                    trip.status === 'full'   ? 'bg-red-400/20 text-red-300' : 'bg-slate-400/20 text-slate-300'
                  }`}>{trip.status}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['Confirmed', confirmed, 'text-white'], ['Boarded', boarded, 'text-emerald-400'], ['Remaining', remaining, remaining > 0 ? 'text-amber-400' : 'text-slate-500']].map(([label, value, color]) => (
                    <div key={label} className="bg-dark-800 rounded-xl p-3 text-center">
                      <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {confirmed > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Boarding progress</span><span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Link to="/driver/validate"
                    className="flex items-center justify-center gap-2 bg-brand-600 text-white font-semibold py-2.5 rounded-xl hover:bg-brand-700 active:scale-95 transition-all text-sm">
                    <CheckCircle size={16} /> Validate Boarding
                  </Link>
                  <button onClick={() => openArrivalModal(trip)}
                    className="flex items-center justify-center gap-2 bg-dark-800 text-white font-semibold py-2.5 rounded-xl hover:bg-dark-600 active:scale-95 transition-all text-sm border border-dark-600">
                    <Bell size={16} /> Signal Arrival
                  </button>
                </div>

                <Link to={`/driver/manifest/${trip.id}`}
                  className="mt-3 flex items-center justify-between text-slate-400 hover:text-white transition-colors text-sm pt-3 border-t border-dark-600">
                  <div className="flex items-center gap-2"><Users size={14} />Passenger manifest ({confirmed})</div>
                  <ChevronRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!arrivalModal} onClose={() => !signalling && setArrivalModal(null)} title="Signal Bus Arrival" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-brand-50 border border-brand-100 rounded-xl">
            <Bell size={16} className="text-brand-600 shrink-0 mt-0.5" />
            <p className="text-sm text-brand-700">Sends a real-time notification to passengers at the selected pickup point.</p>
          </div>
          <div>
            <label className="label">Select Pickup Location</label>
            <select className="input-field" value={selectedPickup} onChange={e => setSelectedPickup(e.target.value)}>
              {(arrivalModal?.pickups || []).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setArrivalModal(null)} disabled={signalling} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSignalArrival} disabled={signalling || !selectedPickup} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {signalling ? <><RefreshCw size={16} className="animate-spin" />Sending…</> : <><Bell size={16} />Notify</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
