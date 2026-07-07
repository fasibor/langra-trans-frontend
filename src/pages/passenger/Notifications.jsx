import { useNotifications } from '../../context/NotificationContext';
import { Bell, Check, CheckCheck, Megaphone, CreditCard, Bus, AlertCircle, Info } from 'lucide-react';
import { CardSkeleton } from '../../components/ui/index.jsx';

const TYPE_CONFIG = {
  PAYMENT_APPROVED:  { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  PAYMENT_REJECTED:  { icon: AlertCircle, color: 'text-red-500',     bg: 'bg-red-50' },
  DRIVER_ARRIVED:    { icon: Bus,         color: 'text-brand-600',   bg: 'bg-brand-50' },
  ANNOUNCEMENT:      { icon: Megaphone,   color: 'text-purple-600',  bg: 'bg-purple-50' },
  DEFAULT:           { icon: Info,        color: 'text-slate-500',   bg: 'bg-slate-50' },
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Notifications() {
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  const cfg = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.DEFAULT;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">Notifications</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 border border-brand-200 rounded-xl px-3 py-1.5"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <CardSkeleton count={5} height="h-20" />
      ) : notifications.length === 0 ? (
        <div className="card text-center py-14">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-slate-300" />
          </div>
          <p className="font-semibold text-dark-800">No notifications yet</p>
          <p className="text-slate-400 text-sm mt-1">We'll notify you about bookings and announcements</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const { icon: Icon, color, bg } = cfg(n.type);
            return (
              <button
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`card w-full text-left flex items-start gap-3 transition-all hover:shadow-md ${
                  n.is_read ? 'opacity-70' : 'border-l-4 border-brand-400'
                }`}
              >
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-dark-800 text-sm leading-tight">{n.title}</p>
                    {!n.is_read && (
                      <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-slate-300 text-xs mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
