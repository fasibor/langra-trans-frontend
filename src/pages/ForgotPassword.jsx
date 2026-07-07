import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import { getErrorMessage } from '../utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex flex-col">
      <header className="p-6">
        <Link to="/login" className="flex items-center gap-2 text-slate-600 hover:text-brand-600 transition-colors w-fit">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to login</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="card text-center py-10">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <h2 className="font-display font-bold text-xl text-dark-900 mb-2">Check your email</h2>
              <p className="text-slate-500 text-sm mb-2">
                If <strong>{email}</strong> is registered, you'll receive a reset link shortly.
              </p>
              <p className="text-slate-400 text-xs mb-6">The link expires in 30 minutes.</p>
              <Link to="/login" className="btn-primary inline-block">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-brand-600" />
                </div>
                <h1 className="font-display font-bold text-2xl text-dark-900 mb-2">Forgot your password?</h1>
                <p className="text-slate-500 text-sm">Enter your email address and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="card space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
