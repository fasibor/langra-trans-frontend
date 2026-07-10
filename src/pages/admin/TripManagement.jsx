import { useState } from 'react';
import { tripsAPI, routesAPI, adminAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatTime, formatCurrency, getErrorMessage } from '../../utils';
import { Modal, CardSkeleton, ErrorState } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { Plus, Calendar, Clock, Users, Eye, X, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const EMPTY_FORM = { route_id: '', travel_date: '', departure_time: '', capacity: 14, driver_id: '' };

export default function TripManagement() {
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [filterDate,   setFilterDate]   = useState('');
  const [filterRoute,  setFilterRoute]  = useState('');
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [manifest,     setManifest]     = useState(null);
  const [manifestLoading, setManifestLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const { data: tripsData, loading, error, refetch } = useAsync(
    () => tripsAPI.getAllAdmin({ date: filterDate || undefined, route_id: filterRoute || undefined }),
    [filterDate, filterRoute]
  );
  const trips = tripsData?.trips || [];

  const { data: routesData } = useAsync(() => routesAPI.getAllAdmin(), []);
  const routes = (routesData?.routes || []).filter(r => r.is_active);

  const { data: driversData } = useAsync(() => adminAPI.getDrivers(), []);
  const drivers = driversData?.drivers || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tripsAPI.create({ ...form, capacity: parseInt(form.capacity), driver_id: form.driver_id || null });
      toast.success('Trip scheduled successfully');
      setForm(EMPTY_FORM);
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmCancelTrip = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await tripsAPI.update(cancelTarget.id, { status: 'cancelled' });
      toast.success('Trip cancelled');
      setCancelTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const loadManifest = async (tripId) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
      setManifest(null);
      return;
    }
    setExpandedTrip(tripId);
    setManifest(null);
    setManifestLoading(true);
    try {
      const res = await tripsAPI.getManifest(tripId);
      setManifest(res.data.manifest);
    } catch {
      toast.error('Failed to load manifest');
    } finally {
      setManifestLoading(false);
    }
  };

  const statusBadge = (s) => ({
    active:    'badge-confirmed',
    full:      'badge-rejected',
    departed:  'badge-boarded',
    cancelled: 'badge-cancelled',
  }[s] || 'badge-pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">Trips</h1>
          <p className="text-slate-500 text-sm mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-brand-600" aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={18} /> Schedule Trip
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="label text-xs">Filter by Date</label>
          <input type="date" className="input-field" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="label text-xs">Filter by Route</label>
          <select className="input-field" value={filterRoute} onChange={e => setFilterRoute(e.target.value)}>
            <option value="">All routes</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {(filterDate || filterRoute) && (
          <button onClick={() => { setFilterDate(''); setFilterRoute(''); }}
            className="mt-5 sm:mt-0 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 self-end pb-1">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* List */}
      {loading ? <CardSkeleton count={4} height="h-28" />
      : error   ? <ErrorState message="Failed to load trips." onRetry={refetch} />
      : trips.length === 0 ? (
        <div className="card text-center py-14">
          <Calendar size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-dark-800 mb-1">No trips found</p>
          <p className="text-slate-400 text-sm mb-5">Try a different filter or schedule a new trip</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={16} /> Schedule Trip
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map(t => {
            const confirmed = parseInt(t.confirmed_bookings || 0);
            const pending   = parseInt(t.pending_payments   || 0);
            const pct       = t.capacity > 0 ? ((t.capacity - t.available_seats) / t.capacity) * 100 : 0;

            return (
              <div key={t.id} className="card border border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark-800 truncate">{t.route_name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} /> {formatTime(t.departure_time)} · {formatDate(t.travel_date)}
                      </p>

                      {/* Seat bar */}
                      <div className="mt-2 mb-1">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Users size={11} /> {t.capacity - t.available_seats}/{t.capacity} seats taken
                          </span>
                          <span className="font-semibold text-brand-600">{formatCurrency(t.fare)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        {confirmed > 0 && <span className="text-xs text-emerald-600 font-medium">{confirmed} confirmed</span>}
                        {pending   > 0 && <span className="text-xs text-amber-600 font-medium">{pending} pending</span>}
                        {t.available_seats === 0 && <span className="badge-rejected text-[10px]">FULL</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={statusBadge(t.status)}>{t.status}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => loadManifest(t.id)}
                        className="text-xs text-brand-600 font-medium flex items-center gap-1 hover:underline">
                        <Eye size={11} /> Manifest
                      </button>
                      {t.status === 'active' && (
                        <button onClick={() => setCancelTarget(t)}
                          className="ml-2 text-xs text-red-500 hover:underline">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manifest expansion */}
                {expandedTrip === t.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {manifestLoading ? (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <RefreshCw size={14} className="animate-spin" /> Loading manifest…
                      </div>
                    ) : manifest?.length === 0 ? (
                      <p className="text-slate-400 text-sm">No confirmed passengers yet.</p>
                    ) : (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                          Passenger Manifest ({manifest?.length})
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {manifest?.map((p, idx) => (
                            <div key={p.id} className="flex items-center gap-3 text-sm py-1 border-b border-slate-50 last:border-0">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${p.booking_status === 'BOARDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                {idx + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-dark-800 text-xs">{p.passenger_name}</p>
                                <p className="text-slate-400 text-xs">{p.pickup_location} → {p.dropoff_location}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono text-xs font-bold text-brand-600">{p.booking_code}</p>
                                {p.booking_status === 'BOARDED' && <CheckCircle size={12} className="text-emerald-500 ml-auto mt-0.5" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule trip modal */}
      <Modal open={showForm} onClose={() => !saving && setShowForm(false)} title="Schedule Trip" maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Route</label>
            <select className="input-field" value={form.route_id} onChange={e => setForm(f => ({...f, route_id: e.target.value}))} required>
              <option value="">Select a route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name} — {formatCurrency(r.fare)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Travel Date</label>
            <input type="date" className="input-field" min={today} value={form.travel_date}
              onChange={e => setForm(f => ({...f, travel_date: e.target.value}))} required />
          </div>
          <div>
            <label className="label">Departure Time</label>
            <input type="time" className="input-field" value={form.departure_time}
              onChange={e => setForm(f => ({...f, departure_time: e.target.value}))} required />
          </div>
          <div>
            <label className="label">Bus Capacity (seats)</label>
            <input type="number" className="input-field" min="1" max="100" value={form.capacity}
              onChange={e => setForm(f => ({...f, capacity: e.target.value}))} required />
          </div>
          <div>
            <label className="label">Assign Driver <span className="text-slate-400 font-normal">(optional)</span></label>
            <select className="input-field" value={form.driver_id} onChange={e => setForm(f => ({...f, driver_id: e.target.value}))}>
              <option value="">— No driver assigned —</option>
              {drivers.filter(d => d.is_active).map(d => <option key={d.id} value={d.id}>{d.name} · {d.phone}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} disabled={saving} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Scheduling…' : 'Schedule Trip'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel confirm modal */}
      <Modal open={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)} title="Cancel Trip" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Cancel this trip?</p>
              <p className="text-red-600 text-xs mt-1">
                {cancelTarget?.route_name} · {formatTime(cancelTarget?.departure_time)} · {formatDate(cancelTarget?.travel_date)}
              </p>
              <p className="text-red-500 text-xs mt-1">Existing confirmed passengers will not be automatically refunded.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCancelTarget(null)} disabled={cancelling} className="btn-secondary flex-1">Keep Trip</button>
            <button onClick={confirmCancelTrip} disabled={cancelling} className="btn-danger flex-1">
              {cancelling ? 'Cancelling…' : 'Cancel Trip'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
