import { Component, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ─── Error Boundary ──────────────────────────────────────────────────────────
// Catches JavaScript errors in any child component tree.
// Without this, a runtime error crashes the entire app.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-dark-800 mb-2">Something went wrong</h3>
            <p className="text-slate-400 text-sm mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn-secondary text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Spinner / Page loader ────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' };
  return (
    <div className={`${sizes[size]} border-brand-200 border-t-brand-600 rounded-full animate-spin ${className}`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-3" />
      <p className="text-slate-500 text-sm">Loading...</p>
    </div>
  </div>
);

// ─── Skeleton ────────────────────────────────────────────────────────────────
export const Skeleton = ({ className = '', lines = 1 }) => {
  if (lines === 1) {
    return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-slate-100 rounded-xl h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 3, height = 'h-24' }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`card animate-pulse ${height}`} />
    ))}
  </div>
);

// ─── Empty state ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="card text-center py-12">
    {Icon && (
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-slate-300" />
      </div>
    )}
    <h3 className="font-semibold text-dark-800 mb-1">{title}</h3>
    {description && <p className="text-slate-400 text-sm mb-5">{description}</p>}
    {action}
  </div>
);

// ─── Error state ─────────────────────────────────────────────────────────────
export const ErrorState = ({ message, onRetry }) => (
  <div className="card text-center py-10 border border-red-100 bg-red-50">
    <AlertCircle size={28} className="text-red-400 mx-auto mb-3" />
    <p className="font-semibold text-red-700 mb-1">Failed to load</p>
    <p className="text-red-500 text-sm mb-4">{message || 'Something went wrong.'}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-sm inline-flex items-center gap-2">
        <RefreshCw size={14} /> Try again
      </button>
    )}
  </div>
);

// ─── Modal ───────────────────────────────────────────────────────────────────
// Single shared modal component replaces the duplicated fixed-overlay pattern
export const Modal = ({ open, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className={`relative bg-white rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
          <h2 id="modal-title" className="font-display font-bold text-xl text-dark-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── Copy to clipboard button ─────────────────────────────────────────────────
// FIX: UX audit flagged missing copy button on bank account number
export const CopyButton = ({ value, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`text-xs font-semibold px-2 py-1 rounded-lg transition-all ${
        copied
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600'
      }`}
      aria-label={`Copy ${label}`}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
};

