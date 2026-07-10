import { useState } from 'react';
import { adminAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { Modal, CardSkeleton, ErrorState } from '../../components/ui/index.jsx';
import { getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';
import { Plus, Bus, Phone, RefreshCw, UserCheck, UserX } from 'lucide-react';

const EMPTY_FORM = { name: '', phone: '', password: '' };

export default function AdminDrivers() {
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [toggling,  setToggling]  = useState(null);

  const { data, loading, error, refetch } = useAsync(() => adminAPI.getDrivers(), []);
  const drivers = data?.drivers || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createDriver(form);
      toast.success('Driver account created');
      setForm(EMPTY_FORM);
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (driver) => {
    setToggling(driver.id);
    try {
      await adminAPI.toggleDriverStatus(driver.id);
      toast.success(`${driver.name} ${driver.is_active ? 'deactivated' : 'activated'}`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">Drivers</h1>
          <p className="text-slate-500 text-sm mt-1">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} registered</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-brand-600" aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={18} /> Add Driver
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <CardSkeleton count={3} height="h-20" />
      ) : error ? (
        <ErrorState message="Failed to load drivers." onRetry={refetch} />
      ) : drivers.length === 0 ? (
        <div className="card text-center py-14">
          <Bus size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-dark-800 mb-1">No drivers yet</p>
          <p className="text-slate-400 text-sm mb-5">Add a driver account to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Driver
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map(d => (
            <div key={d.id} className="card flex items-center gap-4">
              <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                <Bus size={20} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-dark-800">{d.name}</p>
                <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone size={12} /> {d.phone}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  d.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {d.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleToggle(d)}
                  disabled={toggling === d.id}
                  className={`p-2 rounded-xl transition-colors ${
                    d.is_active
                      ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                      : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  title={d.is_active ? 'Deactivate driver' : 'Activate driver'}
                >
                  {toggling === d.id
                    ? <RefreshCw size={16} className="animate-spin" />
                    : d.is_active ? <UserX size={16} /> : <UserCheck size={16} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add driver modal */}
      <Modal open={showForm} onClose={() => !saving && setShowForm(false)} title="Add Driver" maxWidth="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Emeka Okafor"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              className="input-field"
              placeholder="e.g. 08012345678"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              minLength={6}
              required
            />
          </div>
          <p className="text-xs text-slate-400">The driver will log in with their phone number and this password.</p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowForm(false)} disabled={saving} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
