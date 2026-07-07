import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [mode, setMode]       = useState('password'); // 'password' | 'pin'
  const [phone, setPhone]     = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSuccess = (token, user) => {
    login(token, user);
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
    if (user.role === 'admin')  navigate('/admin');
    else if (user.role === 'driver') navigate('/driver');
    else navigate('/dashboard');
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ phone, password });
      onSuccess(res.data.token, res.data.user);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.loginPin({ phone, pin });
      onSuccess(res.data.token, res.data.user);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex flex-col">
      <header className="p-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-brand-100">
            <img src="/logo.png" alt="Langra Trans" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-dark-800">Langra Trans</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-2xl text-dark-900 mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to book your rides</p>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl mb-4">
            {[['password', 'Password'], ['pin', 'PIN']].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-white text-dark-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Phone field shared by both modes */}
          <div className="card space-y-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="08012345678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>

            {mode === 'password' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-brand-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="input-field pr-12"
                      placeholder="Your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePinLogin} className="space-y-4">
                <div>
                  <label className="label">PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    className="input-field text-center tracking-widest font-mono text-2xl"
                    placeholder="••••"
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your 4–6 digit PIN.{' '}
                    <Link to="/settings" className="text-brand-600 hover:underline">
                      Set up PIN
                    </Link>
                  </p>
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in with PIN'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            New to Langra Trans?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
