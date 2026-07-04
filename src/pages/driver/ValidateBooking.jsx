import { useState, useRef, useEffect } from 'react';
import { boardingAPI } from '../../api';
import { getErrorMessage } from '../../utils';
import { ScanLine, CheckCircle, XCircle, AlertTriangle, RotateCcw, Keyboard } from 'lucide-react';

const STATUS_CONFIG = {
  BOARDED: {
    icon: CheckCircle,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    title: '✓ Valid Ticket — Boarded',
    titleColor: 'text-emerald-700',
  },
  ALREADY_USED: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    title: '⚠ Already Boarded',
    titleColor: 'text-amber-700',
  },
  INVALID: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    title: '✗ Invalid Ticket',
    titleColor: 'text-red-700',
  },
};

export default function ValidateBooking() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const inputRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleValidate = async (e) => {
    e?.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await boardingAPI.validate(trimmed);
      const data = {
        ...res.data,
        timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        code: trimmed,
      };
      setResult(data);
      setScanHistory(prev => [data, ...prev].slice(0, 20));
    } catch (err) {
      const errData = err.response?.data || {};
      const data = {
        valid: false,
        status: errData.status || 'INVALID',
        message: errData.message || getErrorMessage(err),
        passenger: errData.passenger,
        timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        code: trimmed,
      };
      setResult(data);
      setScanHistory(prev => [data, ...prev].slice(0, 20));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setCode('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const config = result ? STATUS_CONFIG[result.status] || STATUS_CONFIG.INVALID : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-dark-900">Boarding Validation</h1>
        <p className="text-slate-400 text-sm mt-1">Enter or scan passenger booking codes</p>
      </div>

      {/* Input form */}
      {!result ? (
        <form onSubmit={handleValidate} className="card space-y-4">
          <div className="text-center py-2">
            <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ScanLine size={30} className="text-brand-400" />
            </div>
            <h2 className="font-semibold text-dark-800">Scan or Enter Code</h2>
            <p className="text-slate-400 text-sm mt-1">Type the booking code manually or scan the QR</p>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Keyboard size={14} />
              Booking Code
            </label>
            <input
              ref={inputRef}
              type="text"
              className="input-field text-center text-xl font-display font-bold tracking-widest uppercase"
              placeholder="LT-XXXXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={9}
              autoComplete="off"
              autoCapitalize="characters"
            />
            <p className="text-xs text-slate-400 text-center mt-1">Format: LT-XXXXXX (e.g. LT-8F2A9K)</p>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="btn-primary w-full text-lg py-4"
          >
            {loading ? 'Validating...' : 'Validate Ticket'}
          </button>
        </form>
      ) : (
        /* Result display */
        <div className={`card border-2 ${config.border} ${config.bg} space-y-4`}>
          <div className="text-center py-2">
            <config.icon size={56} className={`${config.iconColor} mx-auto mb-3`} />
            <h2 className={`font-display font-bold text-xl ${config.titleColor}`}>{config.title}</h2>
            <p className={`text-sm mt-1 ${config.titleColor} opacity-70`}>{result.message}</p>
          </div>

          {result.passenger && (
            <div className="bg-white rounded-2xl p-4 space-y-3">
              <div className="text-center border-b border-slate-100 pb-3">
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Passenger</p>
                <p className="font-display font-bold text-xl text-dark-900 mt-1">{result.passenger.name}</p>
                <p className="text-slate-500 text-sm">{result.passenger.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Route</p>
                  <p className="font-semibold text-dark-800">{result.passenger.route}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Code</p>
                  <p className="font-mono font-bold text-brand-600">{result.passenger.booking_code || result.code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pickup</p>
                  <p className="font-semibold text-dark-800">{result.passenger.pickup}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Drop-off</p>
                  <p className="font-semibold text-dark-800">{result.passenger.dropoff}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Scanned at {result.timestamp}</span>
            <span className="font-mono">{result.code}</span>
          </div>

          <button onClick={handleReset} className="btn-primary w-full flex items-center justify-center gap-2">
            <RotateCcw size={18} />
            Scan Next Passenger
          </button>
        </div>
      )}

      {/* Scan history */}
      {scanHistory.length > 0 && (
        <div>
          <h3 className="font-semibold text-dark-800 mb-3">Recent Scans</h3>
          <div className="space-y-2">
            {scanHistory.map((scan, idx) => (
              <div
                key={idx}
                className={`card flex items-center gap-3 py-3 border ${
                  scan.status === 'BOARDED' ? 'border-emerald-100 bg-emerald-50/30' :
                  scan.status === 'ALREADY_USED' ? 'border-amber-100 bg-amber-50/30' :
                  'border-red-100 bg-red-50/30'
                }`}
              >
                {scan.status === 'BOARDED' ? (
                  <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                ) : scan.status === 'ALREADY_USED' ? (
                  <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                ) : (
                  <XCircle size={18} className="text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark-800 text-sm truncate">
                    {scan.passenger?.name || 'Unknown'}
                  </p>
                  <p className="font-mono text-xs text-slate-400">{scan.code}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{scan.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
