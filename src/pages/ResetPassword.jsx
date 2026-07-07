import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../api';
import { getErrorMessage } from '../utils';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle, XCircle, Lock } from 'lucide-react';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get('token');

  const [tokenValid, setTokenValid]   = useState(null); // null=loading, true, false
  const [password,   setPassword]     = useState('');
  const [confirm,    setConfirm]      = useState('');
  const [showPass,   setShowPass]     = useState(false);
  const [loading,    setLoading]      = useState(false);
  const [done,       setDone]         = useState(false);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    authAPI.verifyResetToken(token)
      .then(res => setTokenValid(res.data.valid))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match.');
    if (password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password });
      setDone(true);
      toast.success('Password updated! Redirecting to login…');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  if (!tokenValid) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center px-4">
      <div className="card text-center py-10 max-w-sm w-full">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle size={24} className="text-red-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-dark-900 mb-2">Link expired or invalid</h2>
        <p className="text-slate-500 text-sm mb-6">This reset link has expired or already been used. Request a new one.</p>
        <Link to="/forgot-password" className="btn-primary inline-block">Request new link</Link>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center px-4">
      <div className="card text-center py-10 max-w-sm w-full">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-emerald-500" />
        </div>
        <h2 className="font-display font-bold text-xl text-dark-900 mb-2">Password updated!</h2>
        <p className="text-slate-500 text-sm">Redirecting you to the login page…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-brand-600" />
          </div>
          <h1 className="font-display font-bold text-2xl text-dark-900 mb-2">Set new password</h1>
          <p className="text-slate-500 text-sm">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Repeat your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
