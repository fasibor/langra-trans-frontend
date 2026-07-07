import { useState } from 'react';
import { announcementsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { CardSkeleton, ErrorState } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { Megaphone, Pin, ChevronDown, ChevronUp, Tag } from 'lucide-react';

const TYPE_LABELS = {
  general:       { label: 'General',        color: 'bg-slate-100 text-slate-600' },
  route_change:  { label: 'Route Change',   color: 'bg-blue-100 text-blue-700' },
  fare_change:   { label: 'Fare Change',    color: 'bg-amber-100 text-amber-700' },
  delay:         { label: 'Delay',          color: 'bg-red-100 text-red-700' },
  promotion:     { label: 'Promotion',      color: 'bg-emerald-100 text-emerald-700' },
  new_route:     { label: 'New Route',      color: 'bg-purple-100 text-purple-700' },
  holiday:       { label: 'Holiday',        color: 'bg-pink-100 text-pink-700' },
  cancellation:  { label: 'Cancellation',   color: 'bg-orange-100 text-orange-700' },
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Announcements() {
  const [expanded, setExpanded] = useState(null);

  const { data, loading, error, refetch } = useAsync(
    () => announcementsAPI.getAll(),
    []
  );

  const announcements = data?.announcements || [];

  const handleRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await announcementsAPI.markRead(id);
      refetch();
    } catch { /* silently ignore */ }
  };

  const toggle = (id, isRead) => {
    setExpanded(prev => prev === id ? null : id);
    handleRead(id, isRead);
  };

  const pinned = announcements.filter(a => a.is_pinned);
  const regular = announcements.filter(a => !a.is_pinned);
  const unread = announcements.filter(a => !a.is_read).length;

  return (
    <div className="space-y-4">
      <div className="pt-2">
        <h1 className="font-display font-bold text-2xl text-dark-900">Announcements</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {loading ? 'Loading…' : `${unread > 0 ? `${unread} unread · ` : ''}${announcements.length} total`}
        </p>
      </div>

      {loading ? (
        <CardSkeleton count={4} height="h-20" />
      ) : error ? (
        <ErrorState message="Failed to load announcements." onRetry={refetch} />
      ) : announcements.length === 0 ? (
        <div className="card text-center py-14">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone size={24} className="text-brand-300" />
          </div>
          <p className="font-semibold text-dark-800">No announcements</p>
          <p className="text-slate-400 text-sm mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Pinned */}
          {pinned.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pin size={13} className="text-brand-600" />
                <p className="text-xs font-bold text-brand-600 uppercase tracking-wide">Pinned</p>
              </div>
              <AnnouncementList
                items={pinned}
                expanded={expanded}
                onToggle={toggle}
                pinned
              />
            </div>
          )}

          {/* Regular */}
          {regular.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Recent</p>
              )}
              <AnnouncementList items={regular} expanded={expanded} onToggle={toggle} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnnouncementList({ items, expanded, onToggle }) {
  return (
    <div className="space-y-2">
      {items.map((a) => {
        const isOpen = expanded === a.id;
        const { label, color } = TYPE_LABELS[a.type] || TYPE_LABELS.general;

        return (
          <button
            key={a.id}
            onClick={() => onToggle(a.id, a.is_read)}
            className={`card w-full text-left transition-all hover:shadow-md ${
              !a.is_read ? 'border-l-4 border-brand-400' : ''
            } ${a.is_pinned ? 'bg-brand-50/50 border border-brand-100' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${a.is_pinned ? 'bg-brand-100' : 'bg-slate-50'} rounded-xl flex items-center justify-center shrink-0`}>
                <Megaphone size={17} className={a.is_pinned ? 'text-brand-600' : 'text-slate-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
                      {!a.is_read && <span className="w-2 h-2 bg-brand-500 rounded-full" />}
                    </div>
                    <p className="font-semibold text-dark-800 text-sm">{a.title}</p>
                    {!isOpen && (
                      <p className="text-slate-400 text-xs mt-0.5 truncate">{a.body}</p>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-slate-300 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-300 shrink-0" />
                  )}
                </div>

                {isOpen && (
                  <p className="text-slate-600 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{a.body}</p>
                )}

                <p className="text-slate-300 text-xs mt-2">
                  {new Date(a.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {a.created_by_name && ` · ${a.created_by_name}`}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
