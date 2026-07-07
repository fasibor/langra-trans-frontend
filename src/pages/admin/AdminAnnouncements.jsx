import { useState } from 'react';
import { announcementsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Modal, CardSkeleton, ErrorState } from '../../components/ui/index.jsx';
import { getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';
import {
  Megaphone, Plus, Edit2, Trash2, Pin, Archive,
  X, RefreshCw, CheckCircle,
} from 'lucide-react';

const TYPES = [
  { value: 'general',      label: 'General' },
  { value: 'route_change', label: 'Route Change' },
  { value: 'fare_change',  label: 'Fare Change' },
  { value: 'delay',        label: 'Delay' },
  { value: 'promotion',    label: 'Promotion' },
  { value: 'new_route',    label: 'New Route' },
  { value: 'holiday',      label: 'Holiday' },
  { value: 'cancellation', label: 'Cancellation' },
];

const TYPE_COLORS = {
  general: 'bg-slate-100 text-slate-600',
  route_change: 'bg-blue-100 text-blue-700',
  fare_change: 'bg-amber-100 text-amber-700',
  delay: 'bg-red-100 text-red-700',
  promotion: 'bg-emerald-100 text-emerald-700',
  new_route: 'bg-purple-100 text-purple-700',
  holiday: 'bg-pink-100 text-pink-700',
  cancellation: 'bg-orange-100 text-orange-700',
};

const EMPTY = { title: '', body: '', type: 'general', is_pinned: false, expires_at: '' };

export default function AdminAnnouncements() {
  const [showForm,      setShowForm]      = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [form,          setForm]          = useState(EMPTY);
  const [saving,        setSaving]        = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [showArchived,  setShowArchived]  = useState(false);

  const { data, loading, error, refetch } = useAsync(
    () => announcementsAPI.getAll({ include_archived: showArchived ? 'true' : 'false' }),
    [showArchived]
  );
  const announcements = data?.announcements || [];

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit   = (a) => {
    setEditing(a.id);
    setForm({
      title: a.title, body: a.body, type: a.type,
      is_pinned: a.is_pinned,
      expires_at: a.expires_at ? a.expires_at.split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      return toast.error('Title and body are required.');
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at || null,
      };
      if (editing) {
        await announcementsAPI.update(editing, payload);
        toast.success('Announcement updated.');
      } else {
        await announcementsAPI.create(payload);
        toast.success('Announcement published and users notified.');
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePin = async (a) => {
    try {
      await announcementsAPI.update(a.id, { is_pinned: !a.is_pinned });
      toast.success(a.is_pinned ? 'Unpinned.' : 'Pinned to top.');
      refetch();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleArchive = async (a) => {
    try {
      await announcementsAPI.update(a.id, { is_archived: !a.is_archived });
      toast.success(a.is_archived ? 'Unarchived.' : 'Archived.');
      refetch();
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await announcementsAPI.remove(deleteTarget.id);
      toast.success('Announcement deleted.');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">Announcements</h1>
          <p className="text-slate-500 text-sm mt-1">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(v => !v)}
            className={`text-sm px-3 py-2 rounded-xl border transition-colors ${
              showArchived ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {showArchived ? 'Hide archived' : 'Show archived'}
          </button>
          <button onClick={refetch} className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-brand-600 transition-colors" aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={18} /> New Announcement
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <CardSkeleton count={4} height="h-28" />
      ) : error ? (
        <ErrorState message="Failed to load announcements." onRetry={refetch} />
      ) : announcements.length === 0 ? (
        <div className="card text-center py-14">
          <Megaphone size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-dark-800 mb-1">No announcements yet</p>
          <p className="text-slate-400 text-sm mb-5">Create one to notify all passengers</p>
          <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={16} /> Create announcement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`card border ${a.is_pinned ? 'border-brand-200 bg-brand-50/30' : ''} ${a.is_archived ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${a.is_pinned ? 'bg-brand-100' : 'bg-slate-50'} rounded-xl flex items-center justify-center shrink-0`}>
                  <Megaphone size={17} className={a.is_pinned ? 'text-brand-600' : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[a.type] || TYPE_COLORS.general}`}>
                          {TYPES.find(t => t.value === a.type)?.label || a.type}
                        </span>
                        {a.is_pinned   && <span className="text-[10px] font-bold text-brand-600 flex items-center gap-0.5"><Pin size={10} /> Pinned</span>}
                        {a.is_archived && <span className="text-[10px] font-bold text-slate-400">Archived</span>}
                      </div>
                      <p className="font-semibold text-dark-800">{a.title}</p>
                      <p className="text-slate-500 text-sm mt-0.5 line-clamp-2">{a.body}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {new Date(a.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {a.created_by_name && ` · by ${a.created_by_name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handlePin(a)}     title={a.is_pinned ? 'Unpin' : 'Pin'} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-brand-600 transition-colors"><Pin size={15} /></button>
                      <button onClick={() => handleArchive(a)} title={a.is_archived ? 'Unarchive' : 'Archive'} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><Archive size={15} /></button>
                      <button onClick={() => openEdit(a)}      className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteTarget(a)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={showForm}
        onClose={() => !saving && setShowForm(false)}
        title={editing ? 'Edit Announcement' : 'New Announcement'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input-field" placeholder="e.g. Fare increase effective 1st August"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required maxLength={255} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input-field resize-none" rows={4}
              placeholder="Full announcement text…"
              value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required maxLength={2000} />
            <p className="text-xs text-slate-400 mt-1">{form.body.length}/2000</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Expires (optional)</label>
              <input type="date" className="input-field" value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => setForm(f => ({ ...f, is_pinned: !f.is_pinned }))}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${form.is_pinned ? 'bg-brand-600 border-brand-600' : 'border-slate-300'}`}>
              {form.is_pinned && <CheckCircle size={12} className="text-white" />}
            </div>
            <span className="text-sm font-medium text-dark-800">Pin to top of announcements</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} disabled={saving} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Publishing…' : editing ? 'Update' : 'Publish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Announcement"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
            <Trash2 size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Are you sure you want to permanently delete <strong>"{deleteTarget?.title}"</strong>? This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
