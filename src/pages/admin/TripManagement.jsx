import { useEffect, useState } from 'react';
import { tripsAPI, routesAPI } from '../../api';
import { formatDate, formatTime, formatCurrency, getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';
import { Plus, Calendar, Clock, Users, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';

const EMPTY_FORM = {
  route_id: '',
  travel_date: '',
  departure_time: '',
  capacity: 14,
  driver_id: '',
};

export default function TripManagement() {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [manifest, setManifest] = useState(null);
  const [manifestLoading, setManifestLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterDate) params.date = filterDate;
    if (filterRoute) params.route_id = filterRoute;
    tripsAPI.getAllAdmin(params)
      .then(res => setTrips(res.data.trips))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    routesAPI.getAllAdmin().then(res => setRoutes(res.data.routes)).catch(console.error);
  }, []);

  useEffect(() => { load(); }, [filterDate, filterRoute]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tripsAPI.create(form);
      toast.success('Trip scheduled successfully');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelTrip = async (id) => {
    if (!confirm('Cancel this trip?')) return;
    try {
      await tripsAPI.update(id, { status: 'cancelled' });
      toast.success('Trip cancelled');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const loadManifest = async (tripId) => {
    if (expandedTrip === tripId) {
      setExpandedTrip(null);
      setManifest(null);
      return;
    }
    setExpandedTrip(tripId);
    setManifestLoading(true);
    try {
      const res = await tripsAPI.getManifest(tripId);
      setManifest(res.data.manifest);
    } catch (err) {
      toast.error('Failed to load manifest');
    } finally {
      setManifestLoading(false);
    }
  };

  const statusColor = (s) => ({
    active: 'badge-confirmed',
    full: 'badge-rejected',
    departed: 'badge-boarded',
    cancelled: 'badge-cancelled',
  }[s] || 'badge-pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">Trip Management</h1>
          <p className="text-slate-500 text-sm mt-1">{trips.length} trips found</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Schedule Trip
        </button>
      </div>

      {/* Create trip form */}
      {showForm && (
        <div className="card border-2 border-brand-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-dark-800">Schedule New Trip</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Route</label>
              <select
                className="input-field"
                value={form.route_id}
                onChange={e => setForm({ ...form, route_id: e.target.value })}
                required
              >
                <option value="">Select a route</option>
                {routes.filter(r => r.is_active).map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {formatCurrency(r.fare)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Travel Date</label>
              <input
                type="date"
                className="input-field"
                min={today}
                value={form.travel_date}
                onChange={e => setForm({ ...form, travel_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Departure Time</label>
              <input
                type="time"
                className="input-field"
                value={form.departure_time}
                onChange={e => setForm({ ...form, departure_time: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Bus Capacity (seats)</label>
              <input
                type="number"
                className="input-field"
                min={1}
                max={60}
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Scheduling...' : 'Schedule Trip'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="date"
            className="input-field"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            placeholder="Filter by date"
          />
        </div>
        <div className="flex-1">
          <select
            className="input-field"
            value={filterRoute}
            onChange={e => setFilterRoute(e.target.value)}
          >
            <option value="">All routes</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
        {(filterDate || filterRoute) && (
          <button
            onClick={() => { setFilterDate(''); setFilterRoute(''); }}
            className="text-sm text-slate-500 hover:text-slate-800 px-3 border border-slate-200 rounded-xl whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Trips list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No trips found</p>
          <p className="text-slate-400 text-sm mt-1">Schedule a new trip to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map(trip => (
            <div key={trip.id} className="card overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Time block */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-bold text-dark-800">{formatTime(trip.departure_time)}</p>
                    <p className="text-slate-400 text-xs">{formatDate(trip.travel_date)}</p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex-1">
                  <p className="font-semibold text-dark-800 text-sm">{trip.route_name}</p>
                  <p className="text-slate-400 text-xs">{formatCurrency(trip.fare)} per seat</p>
                </div>

                {/* Seats */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Available</p>
                    <p className={`font-bold text-lg ${trip.available_seats === 0 ? 'text-red-500' : trip.available_seats <= 3 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {trip.available_seats}/{trip.capacity}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Confirmed</p>
                    <p className="font-bold text-lg text-dark-800">{trip.confirmed_bookings || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Pending</p>
                    <p className="font-bold text-lg text-amber-600">{trip.pending_payments || 0}</p>
                  </div>
                </div>

                {/* Status & actions */}
                <div className="flex items-center gap-2">
                  <span className={statusColor(trip.status)}>{trip.status}</span>
                  {trip.status !== 'cancelled' && (
                    <>
                      <button
                        onClick={() => loadManifest(trip.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        title="View manifest"
                      >
                        {expandedTrip === trip.id ? <ChevronUp size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleCancelTrip(trip.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                        title="Cancel trip"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Manifest panel */}
              {expandedTrip === trip.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-dark-800 text-sm mb-3 flex items-center gap-2">
                    <Users size={16} className="text-brand-600" />
                    Passenger Manifest ({manifest?.length || 0} confirmed)
                  </h4>
                  {manifestLoading ? (
                    <div className="text-center py-4 text-slate-400 text-sm">Loading...</div>
                  ) : manifest?.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm">No confirmed passengers yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-slate-400 text-xs border-b border-slate-100">
                            <th className="pb-2 font-semibold">#</th>
                            <th className="pb-2 font-semibold">Passenger</th>
                            <th className="pb-2 font-semibold">Phone</th>
                            <th className="pb-2 font-semibold">Pickup → Drop-off</th>
                            <th className="pb-2 font-semibold">Code</th>
                            <th className="pb-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {manifest.map((p, idx) => (
                            <tr key={p.id} className="text-slate-700">
                              <td className="py-2 text-slate-400">{idx + 1}</td>
                              <td className="py-2 font-medium">{p.passenger_name}</td>
                              <td className="py-2 text-slate-500">{p.passenger_phone}</td>
                              <td className="py-2 text-slate-500 text-xs">{p.pickup_location} → {p.dropoff_location}</td>
                              <td className="py-2 font-mono text-xs text-brand-600 font-bold">{p.booking_code}</td>
                              <td className="py-2">
                                <span className={p.booking_status === 'BOARDED' ? 'badge-boarded' : 'badge-confirmed'}>
                                  {p.booking_status === 'BOARDED' ? 'Boarded' : 'Confirmed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
