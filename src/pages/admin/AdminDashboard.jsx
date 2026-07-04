import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { formatCurrency, formatDate, formatTime, getStatusBadgeClass, getStatusLabel } from '../../utils';
import { TrendingUp, CheckCircle, Clock, Bus, CreditCard, Users, ChevronRight } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};

  const statCards = [
    { label: 'Total Bookings', value: stats.total_bookings || 0, icon: Users, color: 'blue' },
    { label: 'Confirmed', value: stats.confirmed_bookings || 0, icon: CheckCircle, color: 'emerald' },
    { label: 'Pending Payments', value: stats.pending_payments || 0, icon: Clock, color: 'amber', link: '/admin/payments' },
    { label: 'Active Trips Today', value: stats.active_trips || 0, icon: Bus, color: 'purple' },
    { label: 'Total Revenue', value: formatCurrency(stats.total_revenue || 0), icon: TrendingUp, color: 'brand', wide: true },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    brand: 'bg-brand-50 text-brand-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-dark-900">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Overview of Langra Trans operations</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`card animate-pulse h-24 ${i === 4 ? 'col-span-2 lg:col-span-4' : ''}`} />
          ))
        ) : (
          statCards.map(({ label, value, icon: Icon, color, link, wide }) => {
            const card = (
              <div className={`card hover:shadow-md transition-shadow ${wide ? 'col-span-2 lg:col-span-4' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
                    <p className={`font-display font-bold ${wide ? 'text-3xl' : 'text-2xl'} text-dark-900`}>{value}</p>
                    {link && <p className="text-brand-500 text-xs font-semibold mt-1">View pending →</p>}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
            return link ? <Link key={label} to={link}>{card}</Link> : <div key={label}>{card}</div>;
          })
        )}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-dark-800">Recent Bookings</h2>
          <Link to="/admin/bookings" className="text-brand-600 text-sm font-medium flex items-center gap-1">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-16" />)}
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Passenger</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden sm:table-cell">Route</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(data?.recent_bookings || []).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-dark-800 text-sm">{b.passenger_name}</p>
                        {b.booking_code && <p className="text-xs text-brand-500 font-mono">{b.booking_code}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell text-xs">{b.route_name}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell text-xs">
                        {formatDate(b.travel_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={getStatusBadgeClass(b.booking_status)}>
                          {getStatusLabel(b.booking_status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-dark-800">
                        {formatCurrency(b.amount)}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recent_bookings?.length) && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">No bookings yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
