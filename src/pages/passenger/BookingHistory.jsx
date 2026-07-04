import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatTime, formatCurrency, getStatusBadgeClass, getStatusLabel } from '../../utils';
import { CardSkeleton, ErrorState } from '../../components/ui/index.jsx';
import { MapPin, Clock, ChevronRight, Plus } from 'lucide-react';
import { useState } from 'react';

const FILTERS = [
  { value: 'all',             label: 'All' },
  { value: 'CONFIRMED',       label: 'Confirmed' },
  { value: 'PENDING_PAYMENT', label: 'Awaiting Payment' },
  { value: 'BOARDED',         label: 'Boarded' },
  { value: 'CANCELLED',       label: 'Cancelled' },
  { value: 'REJECTED',        label: 'Rejected' },
];

export default function BookingHistory() {
  const [filter, setFilter] = useState('all');

  const { data, loading, error, refetch } = useAsync(
    () => bookingsAPI.getMine({ limit: 50 }),
    []
  );

  const bookings = data?.bookings || [];
  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.booking_status === filter);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display font-bold text-2xl text-dark-900">My Trips</h1>
        <p className="text-slate-400 text-sm mt-1">
          {loading ? 'Loading…' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === value
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={4} height="h-24" />
      ) : error ? (
        <ErrorState message="Could not load your bookings." onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-10">
          <MapPin size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No bookings found</p>
          <p className="text-slate-400 text-sm mt-1">
            {filter !== 'all' ? 'Try a different filter' : 'Book your first ride to get started'}
          </p>
          {filter === 'all' && (
            <Link to="/book" className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={16} /> Book a ride
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="card block hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-dark-800 text-sm leading-tight truncate">{b.route_name}</p>
                    <span className={`${getStatusBadgeClass(b.booking_status)} shrink-0`}>
                      {getStatusLabel(b.booking_status)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                    <Clock size={11} />
                    {formatTime(b.departure_time)} · {formatDate(b.travel_date)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-500 truncate max-w-[160px]">
                      {b.pickup_location} → {b.dropoff_location}
                    </p>
                    <p className="font-bold text-dark-800 text-sm shrink-0 ml-2">{formatCurrency(b.amount)}</p>
                  </div>
                  {b.booking_code && (
                    <p className="text-xs text-brand-600 font-mono font-bold mt-1">{b.booking_code}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-200 shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
