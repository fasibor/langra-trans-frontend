import { useState, useRef, useEffect } from 'react';
import { boardingAPI } from '../../api';
import { getErrorMessage, formatCurrency } from '../../utils';
import { Modal } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';
import { ScanLine, Keyboard, CheckCircle, XCircle, AlertTriangle, RefreshCw, User, Clock } from 'lucide-react';

const RESULT_TYPES = {
  BOARDED:      { icon: CheckCircle,   color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-200', label: 'Valid — Boarded' },
  ALREADY_USED: { icon: AlertTriangle, color: 'text-amber-500',   bg: 'bg-amber-50 border-amber-200',     label: 'Already Boarded' },
  INVALID:      { icon: XCircle,       color: 'text-red-500',     bg: 'bg-red-50 border-red-200',         label: 'Invalid Ticket' },
};

export default function ValidateBooking() {
  const [mode,       setMode]       = useState('manual'); // 'manual' | 'scanner'
  const [code,       setCode]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { code }
  const [scanHistory, setScanHistory]  = useState([]);
  const inputRef   = useRef(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  // Auto-focus input in manual mode
  useEffect(() => {
    if (mode === 'manual' && inputRef.current) inputRef.current.focus();
  }, [mode, result]);

  // Start QR scanner
  useEffect(() => {
    if (mode !== 'scanner') return;

    let scanner;
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (!scannerRef.current) return;
      scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // QR contains JSON or just the booking code
          let bookingCode = decodedText.trim().toUpperCase();
          try {
            const parsed = JSON.parse(decodedText);
            bookingCode = (parsed.code || parsed.booking_code || decodedText).trim().toUpperCase();
          } catch { /* plain text code */ }

          scanner.stop().catch(() => {});
          setMode('manual');
          setCode(bookingCode);
          handleValidate(bookingCode);
        },
        () => { /* scan errors are normal — ignore */ }
      ).catch(() => {
        toast.error('Could not access camera. Please use manual entry.');
        setMode('manual');
      });
    });

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current.stop().catch(() => {});
        html5QrRef.current = null;
      }
    };
  }, [mode]);

  const codeRef = useRef('');
  codeRef.current = code;

  const handleValidate = async (bookingCode) => {
    const trimmed = (bookingCode || codeRef.current).trim().toUpperCase();
    if (!trimmed) { toast.error('Enter a booking code.'); return; }
    if (loading) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await boardingAPI.validate(trimmed);
      const data = res.data;
      setResult({ ...data, code: trimmed });
      setScanHistory(h => [{ code: trimmed, status: data.status, passenger: data.passenger?.name || '—', time: new Date() }, ...h.slice(0, 19)]);
      setCode('');
      if (data.valid) toast.success('✅ Passenger boarded!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Validation failed.';
      const status = err.response?.data?.status || 'INVALID';
      setResult({ valid: false, status, message: msg, code: trimmed });
      setScanHistory(h => [{ code: trimmed, status, passenger: err.response?.data?.passenger?.name || '—', time: new Date() }, ...h.slice(0, 19)]);
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConfirmModal({ code: code.trim().toUpperCase() });
  };

  const confirmAndValidate = () => {
    const c = confirmModal?.code;
    setConfirmModal(null);
    handleValidate(c);
  };

  const statusColors = { BOARDED: 'text-emerald-400', ALREADY_USED: 'text-amber-400', INVALID: 'text-red-400' };

  return (
    <div className="space-y-4">
      <div className="pt-2">
        <h1 className="font-display font-bold text-2xl text-white">Boarding Validation</h1>
        <p className="text-slate-400 text-sm mt-0.5">Scan QR code or enter booking code</p>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-2 gap-2 bg-dark-700 p-1 rounded-xl">
        {[['manual', Keyboard, 'Manual Entry'], ['scanner', ScanLine, 'QR Scanner']].map(([m, Icon, label]) => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setCode(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === m ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* Scanner view */}
      {mode === 'scanner' && (
        <div className="bg-dark-700 rounded-2xl overflow-hidden border border-dark-600">
          <div id="qr-reader" ref={scannerRef} className="w-full" />
          <div className="p-4 text-center">
            <p className="text-slate-400 text-sm">Point your camera at the passenger's QR code</p>
          </div>
        </div>
      )}

      {/* Manual entry */}
      {mode === 'manual' && (
        <form onSubmit={handleSubmit}>
          <div className="bg-dark-700 rounded-2xl p-4 border border-dark-600">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Booking Code</label>
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-dark-800 border border-dark-600 text-white font-mono font-bold text-2xl tracking-widest text-center rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase placeholder-slate-600"
              placeholder="LT-XXXXXX"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" disabled={loading || !code.trim()}
              className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
              {loading ? <><RefreshCw size={16} className="animate-spin" />Validating…</> : 'Validate Ticket'}
            </button>
          </div>
        </form>
      )}

      {/* Result card */}
      {result && (() => {
        const cfg = RESULT_TYPES[result.status] || RESULT_TYPES.INVALID;
        const Icon = cfg.icon;
        return (
          <div className={`rounded-2xl p-5 border-2 ${cfg.bg}`}>
            <div className="flex items-center gap-3 mb-3">
              <Icon size={28} className={cfg.color} />
              <div>
                <p className={`font-display font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
                <p className="text-slate-600 text-sm">{result.message}</p>
              </div>
            </div>
            {result.passenger && (
              <div className="bg-white rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <p className="font-bold text-dark-800">{result.passenger.name}</p>
                  <p className="text-slate-400 text-xs">{result.passenger.phone}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[['Route', result.passenger.route], ['Code', result.code], ['Pickup', result.passenger.pickup], ['Drop-off', result.passenger.dropoff]].map(([l, v]) => (
                    <div key={l}><p className="text-slate-400">{l}</p><p className="font-semibold text-dark-800">{v}</p></div>
                  ))}
                </div>
                {result.passenger.amount && (
                  <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">
                    Fare paid: <span className="font-bold text-dark-800">{formatCurrency(result.passenger.amount)}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Scan history */}
      {scanHistory.length > 0 && (
        <div className="bg-dark-700 rounded-2xl p-4 border border-dark-600">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Scan History</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {scanHistory.map((h, i) => (
              <div key={i} className="flex items-center gap-3 text-sm py-1.5 border-b border-dark-600 last:border-0">
                <span className={`text-lg ${h.status === 'BOARDED' ? '✅' : h.status === 'ALREADY_USED' ? '⚠️' : '❌'}`}>
                  {h.status === 'BOARDED' ? '✅' : h.status === 'ALREADY_USED' ? '⚠️' : '❌'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-mono font-bold text-xs">{h.code}</p>
                  <p className="text-slate-500 text-xs truncate">{h.passenger}</p>
                </div>
                <p className="text-slate-600 text-xs shrink-0">{h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Boarding" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Validate boarding for code:</p>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="font-display font-bold text-3xl tracking-widest text-dark-900">{confirmModal?.code}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setConfirmModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={confirmAndValidate} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Confirm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
