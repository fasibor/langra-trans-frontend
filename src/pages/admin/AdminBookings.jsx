import { useState, useCallback } from 'react';
import { bookingsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatTime, formatCurrency, getStatusBadgeClass, getStatusLabel } from '../../utils';
import { CardSkeleton, ErrorState } from '../../components/ui/index.jsx';
import { Search, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 25;
const STATUSES = [
  { value: '',                label: 'All' },
  { value: 'PENDING',         label: 'Pending Payment' },
  { value: 'CONFIRMED',       label: 'Confirmed' },
  { value: 'REJECTED',        label: 'Rejected' },
];

export default function AdminBookings() {
  const [filter, setFilter]   = useState('');
  const [search, setSearch]   = useState('');
  const [query, setQuery]     = useState('');   // debounced search actually sent
  const [offset, setOffset]   = useState(0);

  // Server-side search+filter+pagination — no unbounded SELECT * 
  const { data, loading, error, refetch } = useAsync(
    () => bookingsAPI.getAllAdmin({
      status: filter || undefined,
      search: query || undefined,
      limit: PAGE_SIZE,
      offset,
    }),
    [filter, query, offset]
  );

  const bookings = data?.bookings || [];
  const total    = data?.total    || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    setQuery(search);
  };

  const handleFilterChange = (val) => {
    setFilter(val);
    setOffset(0);
  };

  const confirmedRevenue = bookings
    .filter(b => b.payment_status === 'CONFIRMED')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">All Bookings</h1>
          <p className="text-slate-500 text-sm mt-1">
            {total} total
            {confirmedRevenue > 0 && ` · ${formatCurrency(confirmedRevenue)} confirmed revenue`}
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              className="input-field pl-9"
              placeholder="Name, phone, booking code, route…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search bookings"
            />
          </div>
          <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => handleFilterChange(s.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filter === s.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={5} height="h-16" />
      ) : error ? (
        <ErrorState message="Failed to load bookings." onRetry={refetch} />
      ) : bookings.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No bookings found</p>
          {query && (
            <button
              onClick={() => { setSearch(''); setQuery(''); }}
              className="text-brand-600 text-sm mt-2 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left text-slate-500 text-xs">
                    <th className="px-5 py-3 font-semibold">Passenger</th>
                    <th className="px-5 py-3 font-semibold">Route</th>
                    <th className="px-5 py-3 font-semibold">Trip</th>
                    <th className="px-5 py-3 font-semibold">Journey</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Code</th>
                    <th className="px-5 py-3 font-semibold">Payment</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-dark-800">{b.passenger_name}</p>
                        <p className="text-slate-400 text-xs">{b.passenger_phone}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-[140px]">
                        <p className="truncate text-xs">{b.route_name}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap text-xs">
                        {formatTime(b.departure_time)}<br />
                        <span className="text-slate-400">{formatDate(b.travel_date)}</span>
                      </td>
                      <td className="px-5 py-3 text-xs max-w-[160px]">
                        <p className="truncate text-slate-600">{b.pickup_location}</p>
                        <p className="truncate text-slate-400">→ {b.dropoff_location}</p>
                      </td>
                      <td className="px-5 py-3 font-bold text-dark-800 whitespace-nowrap">
                        {formatCurrency(b.amount)}
                      </td>
                      <td className="px-5 py-3">
                        {b.booking_code
                          ? <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{b.booking_code}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>
                      <td className="px-5 py-3">
                        <span className={getStatusBadgeClass(b.payment_status)}>
                          {getStatusLabel(b.payment_status)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={getStatusBadgeClass(b.booking_status)}>
                          {getStatusLabel(b.booking_status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-dark-800">{b.passenger_name}</p>
                    <p className="text-slate-400 text-xs">{b.passenger_phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={getStatusBadgeClass(b.booking_status)}>
                      {getStatusLabel(b.booking_status)}
                    </span>
                    <p className="font-bold text-dark-800 mt-1">{formatCurrency(b.amount)}</p>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">Route</p>
                    <p className="font-medium text-dark-800 truncate">{b.route_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Trip</p>
                    <p className="font-medium text-dark-800">{formatTime(b.departure_time)} · {formatDate(b.travel_date)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Payment</p>
                    <span className={getStatusBadgeClass(b.payment_status)}>{getStatusLabel(b.payment_status)}</span>
                  </div>
                  {b.booking_code && (
                    <div>
                      <p className="text-slate-400">Code</p>
                      <p className="font-mono font-bold text-brand-600">{b.booking_code}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                  disabled={offset === 0}
                  className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:border-brand-300 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-dark-800 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={offset + PAGE_SIZE >= total}
                  className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:border-brand-300 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
