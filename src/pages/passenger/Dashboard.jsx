import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatTime, formatCurrency, getStatusBadgeClass, getStatusLabel, isUpcoming } from '../../utils';
import { CardSkeleton } from '../../components/ui/index.jsx';
import { MapPin, Clock, Plus, ChevronRight, Ticket } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch recent bookings (limit 10 is enough for the dashboard view)
  const { data, loading } = useAsync(
    () => bookingsAPI.getMine({ limit: 10 }),
    []
  );

  const bookings = data?.bookings || [];

  const upcomingBookings = bookings.filter(b =>
    isUpcoming(b.travel_date) &&
    ['CONFIRMED', 'PENDING_PAYMENT'].includes(b.booking_status)
  );
  const nextRide = upcomingBookings[0];

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-slate-500 text-sm">Good {getGreeting()}</p>
        <h1 className="font-display font-bold text-2xl text-dark-900">
          {user?.name?.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Next ride card */}
      {loading ? (
        <CardSkeleton count={1} height="h-44" />
      ) : nextRide ? (
        <Link to={`/bookings/${nextRide.id}`} className="block">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white shadow-xl shadow-brand-600/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-brand-100 text-xs font-semibold uppercase tracking-wide">
                {nextRide.booking_status === 'CONFIRMED' ? 'Next Ride' : 'Awaiting Confirmation'}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                nextRide.booking_status === 'CONFIRMED'
                  ? 'bg-emerald-400/20 text-emerald-200'
                  : 'bg-amber-400/20 text-amber-200'
              }`}>
                {getStatusLabel(nextRide.booking_status)}
              </span>
            </div>

            <h2 className="font-display font-bold text-xl mb-3">{nextRide.route_name}</h2>

            <div className="flex items-center gap-3 text-brand-100 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                {formatTime(nextRide.departure_time)} · {formatDate(nextRide.travel_date)}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                <p className="text-brand-200 text-xs mb-0.5">From</p>
                <p className="font-semibold text-white text-sm truncate">{nextRide.pickup_location}</p>
              </div>
              <div className="text-brand-300 shrink-0">→</div>
              <div className="flex-1 bg-white/10 rounded-xl px-3 py-2">
                <p className="text-brand-200 text-xs mb-0.5">To</p>
                <p className="font-semibold text-white text-sm truncate">{nextRide.dropoff_location}</p>
              </div>
            </div>

            {nextRide.booking_code && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-brand-200 text-xs">Booking Code</p>
                  <p className="font-display font-bold text-lg tracking-widest">{nextRide.booking_code}</p>
                </div>
                <ChevronRight size={20} className="text-brand-300" />
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="card text-center py-10">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ticket size={24} className="text-brand-400" />
          </div>
          <h3 className="font-semibold text-dark-800 mb-1">No upcoming rides</h3>
          <p className="text-slate-400 text-sm mb-5">Book your first ride to get started</p>
          <Link to="/book" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Book a ride
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h3 className="font-semibold text-dark-800 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/book" className="card flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]">
            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-brand-600" />
            </div>
            <div>
              <p className="font-semibold text-dark-800 text-sm">Book Ride</p>
              <p className="text-slate-400 text-xs">Find a trip</p>
            </div>
          </Link>
          <Link to="/bookings" className="card flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98]">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="font-semibold text-dark-800 text-sm">My Trips</p>
              <p className="text-slate-400 text-xs">
                {loading ? '...' : `${data?.total ?? 0} booking${(data?.total ?? 0) !== 1 ? 's' : ''}`}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent bookings */}
      {!loading && bookings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-dark-800">Recent Bookings</h3>
            <Link to="/bookings" className="text-brand-600 text-sm font-medium">View all</Link>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 4).map((b) => (
              <Link key={b.id} to={`/bookings/${b.id}`} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-800 text-sm truncate">{b.route_name}</p>
                  <p className="text-slate-400 text-xs">{formatDate(b.travel_date)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={getStatusBadgeClass(b.booking_status)}>
                    {getStatusLabel(b.booking_status)}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">{formatCurrency(b.amount)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
