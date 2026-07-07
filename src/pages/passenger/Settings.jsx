import { useState, useEffect } from 'react';
import { settingsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { getErrorMessage } from '../../utils';
import { CardSkeleton, Modal } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';
import {
  Lock, Bell, BellOff, Shield, Eye, EyeOff,
  ToggleLeft, ToggleRight, Check,
} from 'lucide-react';

const Toggle = ({ enabled, onToggle, label, desc, icon: Icon }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div>
        <p className="font-semibold text-dark-800 text-sm">{label}</p>
        {desc && <p className="text-slate-400 text-xs mt-0.5">{desc}</p>}
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`transition-colors ${enabled ? 'text-brand-600' : 'text-slate-300'}`}
      aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
    >
      {enabled ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
    </button>
  </div>
);

export default function Settings() {
  const { data, loading } = useAsync(() => settingsAPI.get(), []);
  const settings = data?.settings;

  const [notifPrefs, setNotifPrefs] = useState({
    notif_booking: true,
    notif_payment: true,
    notif_arrival: true,
    notif_announcement: true,
  });

  const [pinForm, setPinForm] = useState({ currentPassword: '', pin: '', confirmPin: '' });
  const [showPin, setShowPin] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [showDisablePin, setShowDisablePin] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    if (settings) {
      setNotifPrefs({
        notif_booking:      settings.notif_booking ?? true,
        notif_payment:      settings.notif_payment ?? true,
        notif_arrival:      settings.notif_arrival ?? true,
        notif_announcement: settings.notif_announcement ?? true,
      });
    }
  }, [settings]);

  const toggleNotif = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    setSavingNotif(true);
    try {
      await settingsAPI.updateNotifications(updated);
    } catch (err) {
      setNotifPrefs(notifPrefs); // revert
      toast.error(getErrorMessage(err));
    } finally {
      setSavingNotif(false);
    }
  };

  const handleSetPin = async (e) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pinForm.pin)) {
      return toast.error('PIN must be 4–6 digits.');
    }
    if (pinForm.pin !== pinForm.confirmPin) {
      return toast.error('PINs do not match.');
    }
    setSavingPin(true);
    try {
      await settingsAPI.setPin({
        pin: pinForm.pin,
        current_password: pinForm.currentPassword,
      });
      toast.success('PIN set successfully! You can now log in with your PIN.');
      setPinForm({ currentPassword: '', pin: '', confirmPin: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPin(false);
    }
  };

  const handleDisablePin = async () => {
    setShowDisablePin(false);
    try {
      await settingsAPI.disablePin();
      toast.success('PIN login disabled.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <CardSkeleton count={3} height="h-36" />;

  return (
    <div className="space-y-5">
      <div className="pt-2">
        <h1 className="font-display font-bold text-2xl text-dark-900">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-brand-600" />
          <h2 className="font-semibold text-dark-800">Notifications</h2>
          {savingNotif && <span className="text-xs text-slate-400">Saving…</span>}
        </div>
        <p className="text-slate-400 text-xs mb-4">Choose which alerts you want to receive</p>

        <Toggle
          icon={Bell} enabled={notifPrefs.notif_booking}
          onToggle={() => toggleNotif('notif_booking')}
          label="Booking updates" desc="When your booking is confirmed or rejected"
        />
        <Toggle
          icon={Bell} enabled={notifPrefs.notif_payment}
          onToggle={() => toggleNotif('notif_payment')}
          label="Payment alerts" desc="When your payment is verified"
        />
        <Toggle
          icon={Bell} enabled={notifPrefs.notif_arrival}
          onToggle={() => toggleNotif('notif_arrival')}
          label="Bus arrival" desc="When your bus arrives at your pickup point"
        />
        <Toggle
          icon={Bell} enabled={notifPrefs.notif_announcement}
          onToggle={() => toggleNotif('notif_announcement')}
          label="Announcements" desc="Route changes, promotions, and updates"
        />
      </div>

      {/* PIN login */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} className="text-brand-600" />
          <h2 className="font-semibold text-dark-800">PIN Login</h2>
          {settings?.pin_enabled && (
            <span className="badge-confirmed text-[10px]">Enabled</span>
          )}
        </div>
        <p className="text-slate-400 text-xs mb-4">
          Set a 4–6 digit PIN to log in faster without typing your full password
        </p>

        <form onSubmit={handleSetPin} className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="Your account password"
                value={pinForm.currentPassword}
                onChange={e => setPinForm(f => ({ ...f, currentPassword: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{4,6}"
                maxLength={6}
                className="input-field text-center tracking-widest font-mono text-xl"
                placeholder="••••"
                value={pinForm.pin}
                onChange={e => setPinForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
                required
              />
            </div>
            <div>
              <label className="label">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{4,6}"
                maxLength={6}
                className="input-field text-center tracking-widest font-mono text-xl"
                placeholder="••••"
                value={pinForm.confirmPin}
                onChange={e => setPinForm(f => ({ ...f, confirmPin: e.target.value.replace(/\D/g, '') }))}
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1" disabled={savingPin}>
              {savingPin ? 'Saving…' : settings?.pin_enabled ? 'Update PIN' : 'Enable PIN Login'}
            </button>
            {settings?.pin_enabled && (
              <button type="button" onClick={() => setShowDisablePin(true)} className="btn-danger px-4">
                Disable
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Disable PIN confirm modal */}
      <Modal open={showDisablePin} onClose={() => setShowDisablePin(false)} title="Disable PIN Login" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-slate-500 text-sm">
            Are you sure you want to disable PIN login? You can re-enable it anytime from Settings.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowDisablePin(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDisablePin} className="btn-danger flex-1">Disable PIN</button>
          </div>
        </div>
      </Modal>

      {/* Biometric — informational */}
      <div className="card border border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-slate-400" />
          <h2 className="font-semibold text-slate-600">Biometric Login</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">Coming soon</span>
        </div>
        <p className="text-slate-400 text-xs">
          Fingerprint and Face ID login (WebAuthn) will be available in a future update.
        </p>
      </div>
    </div>
  );
}
