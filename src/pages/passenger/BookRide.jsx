import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routesAPI, tripsAPI, bookingsAPI } from '../../api';
import { formatCurrency, formatDate, formatTime, getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';
import { MapPin, ChevronRight, ChevronLeft, Clock, Calendar, CheckCircle } from 'lucide-react';

const STEPS = ['Route', 'Trip', 'Details', 'Confirm'];

export default function BookRide() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState({
    route: null,
    trip: null,
    pickup: '',
    dropoff: '',
    date: '',
  });

  // Load routes on mount
  useEffect(() => {
    routesAPI.getAll().then(res => setRoutes(res.data.routes)).catch(console.error);
  }, []);

  // Load trips when route + date selected
  useEffect(() => {
    if (selected.route && selected.date) {
      setLoading(true);
      tripsAPI.getAvailable({ route_id: selected.route.id, date: selected.date })
        .then(res => setTrips(res.data.trips))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selected.route, selected.date]);

  const today = new Date().toISOString().split('T')[0];

  const handleBook = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.create({
        trip_id: selected.trip.id,
        pickup_location: selected.pickup,
        dropoff_location: selected.dropoff,
      });
      toast.success('Booking created! Please submit your payment reference.');
      navigate(`/bookings/${res.data.booking.id}`, { state: { newBooking: true } });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-dark-900">Book a Ride</h1>
        <p className="text-slate-400 text-sm mt-1">Find and book available trips</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
              i < step ? 'bg-emerald-500 text-white' :
              i === step ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <div className={`flex-1 h-0.5 mx-1 ${i < step ? 'bg-emerald-400' : 'bg-slate-100'} ${i === STEPS.length - 1 ? 'hidden' : ''}`} />
          </div>
        ))}
      </div>

      {/* Step 0: Select Route */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-dark-800">Select a Route</h2>
          {routes.length === 0 ? (
            <div className="card text-center py-8 text-slate-400">No routes available</div>
          ) : (
            routes.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelected({ ...selected, route: r, trip: null, pickup: '', dropoff: '' });
                  setStep(1);
                }}
                className="card w-full text-left hover:shadow-md hover:border-brand-200 transition-all active:scale-98 border-2 border-transparent"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-dark-800">{r.name}</p>
                      <p className="text-brand-600 font-bold text-sm">{formatCurrency(r.fare)}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Step 1: Select Date & Trip */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-800">Select Date & Trip</h2>

          <div className="card">
            <p className="text-sm font-semibold text-slate-500 mb-1">Route</p>
            <p className="font-bold text-dark-800">{selected.route?.name}</p>
            <p className="text-brand-600 font-semibold">{formatCurrency(selected.route?.fare)}</p>
          </div>

          <div>
            <label className="label">Travel Date</label>
            <input
              type="date"
              className="input-field"
              min={today}
              value={selected.date}
              onChange={(e) => setSelected({ ...selected, date: e.target.value, trip: null })}
            />
          </div>

          {selected.date && (
            <div>
              <h3 className="font-semibold text-dark-800 mb-2">Available Trips</h3>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="card animate-pulse h-20" />)}
                </div>
              ) : trips.length === 0 ? (
                <div className="card text-center py-6 text-slate-400">
                  <p>No trips available for this date</p>
                  <p className="text-xs mt-1">Try selecting a different date</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {trips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (t.available_seats === 0) return;
                        setSelected({ ...selected, trip: t });
                        setStep(2);
                      }}
                      disabled={t.available_seats === 0}
                      className={`card w-full text-left border-2 transition-all ${
                        t.available_seats === 0
                          ? 'opacity-50 cursor-not-allowed border-transparent'
                          : 'hover:border-brand-300 hover:shadow-md active:scale-98 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            t.available_seats > 3 ? 'bg-emerald-50' : 'bg-amber-50'
                          }`}>
                            <Clock size={18} className={t.available_seats > 3 ? 'text-emerald-600' : 'text-amber-600'} />
                          </div>
                          <div>
                            <p className="font-bold text-dark-800">{formatTime(t.departure_time)}</p>
                            <p className="text-xs text-slate-400">{formatDate(t.travel_date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {t.available_seats === 0 ? (
                            <span className="badge-rejected">FULL</span>
                          ) : (
                            <>
                              <span className={`text-xs font-bold ${t.available_seats <= 3 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {t.available_seats} seat{t.available_seats !== 1 ? 's' : ''} left
                              </span>
                              <ChevronRight size={16} className="text-slate-300 ml-2 inline" />
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => setStep(0)} className="btn-secondary w-full flex items-center justify-center gap-2">
            <ChevronLeft size={18} /> Back
          </button>
        </div>
      )}

      {/* Step 2: Pickup & Dropoff */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-800">Your Journey Details</h2>

          <div className="card bg-brand-50 border border-brand-100">
            <div className="flex gap-4 text-sm">
              <div>
                <p className="text-brand-600 font-semibold">{formatTime(selected.trip?.departure_time)}</p>
                <p className="text-slate-500 text-xs">{formatDate(selected.trip?.travel_date)}</p>
              </div>
              <div className="border-l border-brand-200 pl-4">
                <p className="font-semibold text-dark-800">{selected.route?.name}</p>
                <p className="text-brand-600 font-bold">{formatCurrency(selected.route?.fare)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Pickup Location</label>
            <select
              className="input-field"
              value={selected.pickup}
              onChange={(e) => setSelected({ ...selected, pickup: e.target.value })}
            >
              <option value="">Select pickup point</option>
              {(selected.route?.pickup_locations || []).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Drop-off Location</label>
            <select
              className="input-field"
              value={selected.dropoff}
              onChange={(e) => setSelected({ ...selected, dropoff: e.target.value })}
            >
              <option value="">Select drop-off point</option>
              {(selected.route?.dropoff_locations || []).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selected.pickup || !selected.dropoff}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-800">Confirm Booking</h2>

          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Route" value={selected.route?.name} />
              <Detail label="Date" value={formatDate(selected.trip?.travel_date)} />
              <Detail label="Departure" value={formatTime(selected.trip?.departure_time)} />
              <Detail label="Seats Left" value={`${selected.trip?.available_seats} of ${selected.trip?.capacity}`} />
              <Detail label="Pickup" value={selected.pickup} />
              <Detail label="Drop-off" value={selected.dropoff} />
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-dark-800">Total Fare</span>
                <span className="font-display font-bold text-2xl text-brand-600">
                  {formatCurrency(selected.route?.fare)}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
              <p className="text-amber-700 text-xs font-medium">
                💡 After booking, you'll need to transfer <strong>{formatCurrency(selected.route?.fare)}</strong> to our bank account and submit your payment reference. Your seat will be confirmed once payment is verified.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={handleBook}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium">{label}</p>
    <p className="font-semibold text-dark-800 text-sm">{value}</p>
  </div>
);
