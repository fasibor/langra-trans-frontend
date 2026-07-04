import { useEffect, useState } from 'react';
import { routesAPI } from '../../api';
import { formatCurrency, getErrorMessage } from '../../utils';
import toast from 'react-hot-toast';
import { Plus, Edit2, ToggleLeft, ToggleRight, X, MapPin } from 'lucide-react';

const EMPTY_FORM = {
  name: '', fare: '', is_active: true,
  pickup_locations: [''], dropoff_locations: [''],
};

export default function RouteManagement() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    routesAPI.getAllAdmin()
      .then(res => setRoutes(res.data.routes))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (r) => {
    setEditing(r.id);
    setForm({
      name: r.name, fare: r.fare,
      is_active: r.is_active,
      pickup_locations: r.pickup_locations.length ? r.pickup_locations : [''],
      dropoff_locations: r.dropoff_locations.length ? r.dropoff_locations : [''],
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const pickups = form.pickup_locations.filter(Boolean);
    const dropoffs = form.dropoff_locations.filter(Boolean);
    if (!form.name || !form.fare || !pickups.length || !dropoffs.length) {
      return toast.error('All fields are required with at least one pickup and drop-off.');
    }
    setSaving(true);
    try {
      const payload = { ...form, pickup_locations: pickups, dropoff_locations: dropoffs, fare: parseFloat(form.fare) };
      if (editing) {
        await routesAPI.update(editing, payload);
        toast.success('Route updated.');
      } else {
        await routesAPI.create(payload);
        toast.success('Route created.');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r) => {
    try {
      await routesAPI.update(r.id, { is_active: !r.is_active });
      toast.success(r.is_active ? 'Route deactivated.' : 'Route activated.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const updateList = (field, idx, val) => {
    setForm(f => ({ ...f, [field]: f[field].map((v, i) => i === idx ? val : v) }));
  };
  const addItem = (field) => setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  const removeItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">Routes</h1>
          <p className="text-slate-400 text-sm">{routes.length} routes configured</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={18} /> New Route
        </button>
      </div>

      {/* Routes list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card animate-pulse h-24" />)}</div>
      ) : routes.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <MapPin size={32} className="mx-auto mb-3 text-slate-200" />
          <p>No routes yet. Create your first route.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {routes.map((r) => (
            <div key={r.id} className={`card border-2 ${r.is_active ? 'border-transparent' : 'border-slate-100 opacity-60'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                    <MapPin size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-dark-800 text-sm">{r.name}</p>
                    <p className="text-brand-600 font-bold text-sm">{formatCurrency(r.fare)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleToggle(r)} className={`p-1.5 rounded-lg ${r.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                    {r.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium mb-1">Pickup Points</p>
                  {r.pickup_locations.map(p => <p key={p} className="text-slate-600 py-0.5">• {p}</p>)}
                </div>
                <div>
                  <p className="text-slate-400 font-medium mb-1">Drop-off Points</p>
                  {r.dropoff_locations.map(d => <p key={d} className="text-slate-600 py-0.5">• {d}</p>)}
                </div>
              </div>
              {!r.is_active && <div className="mt-2"><span className="badge-cancelled">Inactive</span></div>}
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display font-bold text-xl">{editing ? 'Edit Route' : 'New Route'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="label">Route Name</label>
                <input className="input-field" placeholder="e.g. Berger → Victoria Island" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div>
                <label className="label">Fare (₦)</label>
                <input type="number" className="input-field" placeholder="e.g. 2500" value={form.fare} onChange={e => setForm(f => ({...f, fare: e.target.value}))} required min="0" />
              </div>

              <LocationList
                label="Pickup Locations"
                items={form.pickup_locations}
                placeholder="e.g. Berger Bus Stop"
                onChange={(i, v) => updateList('pickup_locations', i, v)}
                onAdd={() => addItem('pickup_locations')}
                onRemove={(i) => removeItem('pickup_locations', i)}
              />

              <LocationList
                label="Drop-off Locations"
                items={form.dropoff_locations}
                placeholder="e.g. Victoria Island (Eko Hotel)"
                onChange={(i, v) => updateList('dropoff_locations', i, v)}
                onAdd={() => addItem('dropoff_locations')}
                onRemove={(i) => removeItem('dropoff_locations', i)}
              />

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Route' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LocationList({ label, items, placeholder, onChange, onAdd, onRemove }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder={placeholder}
              value={item}
              onChange={e => onChange(i, e.target.value)}
            />
            {items.length > 1 && (
              <button type="button" onClick={() => onRemove(i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={onAdd} className="text-brand-600 text-sm font-medium flex items-center gap-1 hover:underline">
          <Plus size={14} /> Add location
        </button>
      </div>
    </div>
  );
}
