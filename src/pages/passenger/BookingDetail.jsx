import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, paymentsAPI } from '../../api';
import {
  formatDate, formatTime, formatCurrency,
  getStatusBadgeClass, getStatusLabel, getErrorMessage,
} from '../../utils';
import { CardSkeleton, ErrorState, CopyButton } from '../../components/ui/index.jsx';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Clock, MapPin, CreditCard,
  CheckCircle, AlertCircle, RefreshCw,
  Upload, X, ImageIcon,
} from 'lucide-react';

// ── Real company bank details ──────────────────────────────────────────────
const BANK = {
  accountName:   'Squad Langra Transportation Limited',
  accountNumber: '9012675289',
  bankName:      'GTBank (Guaranty Trust Bank)',
};

const TERMINAL_STATUSES = ['CONFIRMED', 'BOARDED', 'CANCELLED', 'REJECTED'];
const MAX_FILE_SIZE_MB  = 5;
const ACCEPTED_TYPES    = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];

export default function BookingDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const mountedRef = useRef(true);
  const pollingRef = useRef(null);
  const fileInputRef = useRef(null);

  const [booking,    setBooking]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Payment form state
  const [payRef,      setPayRef]      = useState('');
  const [proofFile,   setProofFile]   = useState(null);   // File object
  const [proofPreview, setProofPreview] = useState(null); // Object URL for preview
  const [fileError,   setFileError]   = useState('');

  // ── Data loading + auto-polling ──────────────────────────────────────────
  const load = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const res = await bookingsAPI.getById(id);
      if (mountedRef.current) {
        setBooking(res.data.booking);
        setLoading(false);
      }
      return res.data.booking;
    } catch (err) {
      if (mountedRef.current) { setError(err); setLoading(false); }
    }
  };

  const startPolling = () => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      const b = await load(false);
      if (b && TERMINAL_STATUSES.includes(b.booking_status)) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 15_000);
  };

  useEffect(() => {
    mountedRef.current = true;
    load(true).then(b => {
      if (b && !TERMINAL_STATUSES.includes(b.booking_status)) startPolling();
    });
    return () => {
      mountedRef.current = false;
      if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
      if (proofPreview) URL.revokeObjectURL(proofPreview);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── File picker ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Please select a JPEG, PNG, WebP, or HEIC image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`Image must be under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    setFileError('');
    setProofFile(file);
    // Create object URL for preview
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setProofFile(null);
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofPreview(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit payment ────────────────────────────────────────────────────────
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const trimmed = payRef.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await paymentsAPI.submit(id, trimmed, proofFile);
      toast.success("Payment submitted! We'll confirm your booking shortly.");
      setPayRef('');
      clearFile();
      load(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Cancel booking ────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(true);
    try {
      await bookingsAPI.cancel(id);
      toast.success('Booking cancelled.');
      navigate('/bookings');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setCancelling(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading && !booking) return <CardSkeleton count={3} height="h-32" />;
  if (error)   return <ErrorState message="Could not load booking." onRetry={() => load(true)} />;
  if (!booking) return <div className="card text-center py-10 text-slate-500">Booking not found.</div>;

  const isConfirmed = booking.booking_status === 'CONFIRMED';
  const isBoarded   = booking.booking_status === 'BOARDED';
  const isPending   = booking.booking_status === 'PENDING_PAYMENT';
  const isRejected  = booking.booking_status === 'REJECTED';

  return (
    <div className="space-y-4 pb-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          aria-label="Go back"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-xl text-dark-900">Booking Details</h1>
          {booking.booking_code && (
            <p className="text-brand-600 font-mono font-bold text-sm">{booking.booking_code}</p>
          )}
        </div>
        <span className={getStatusBadgeClass(booking.booking_status)}>
          {getStatusLabel(booking.booking_status)}
        </span>
      </div>

      {/* ── QR boarding pass ── */}
      {(isConfirmed || isBoarded) && booking.booking_code && (
        <div className={`card text-center border-2 ${isBoarded ? 'border-blue-200 bg-blue-50' : 'border-brand-200 bg-brand-50'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isBoarded ? 'text-blue-600' : 'text-brand-600'}`}>
            {isBoarded ? '✅ Ticket Used — Boarded' : '🎫 Your Boarding Pass'}
          </p>
          <p className="font-display font-extrabold text-3xl tracking-widest text-dark-900 mb-4">
            {booking.booking_code}
          </p>
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
              <QRCodeSVG value={booking.booking_code} size={160} fgColor="#1a1a2e" level="M" includeMargin={false} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            {[
              { label: 'From',      value: booking.pickup_location },
              { label: 'To',        value: booking.dropoff_location },
              { label: 'Date',      value: formatDate(booking.travel_date) },
              { label: 'Departure', value: formatTime(booking.departure_time) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="font-semibold text-dark-800 text-sm">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4">Show this QR code or booking code to board your bus</p>
        </div>
      )}

      {/* ── Trip info ── */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-dark-800 text-sm">Trip Information</h3>
        <InfoRow icon={MapPin} label="Route"     value={booking.route_name} />
        <InfoRow icon={Clock}  label="Departure" value={`${formatTime(booking.departure_time)} · ${formatDate(booking.travel_date)}`} />
        <div className="flex gap-3 pt-1">
          <div className="flex-1">
            <p className="text-xs text-slate-400">Pickup</p>
            <p className="text-sm font-semibold text-dark-800">{booking.pickup_location}</p>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-400">Drop-off</p>
            <p className="text-sm font-semibold text-dark-800">{booking.dropoff_location}</p>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
          <span className="text-sm text-slate-500">Fare</span>
          <span className="font-display font-bold text-xl text-dark-900">{formatCurrency(booking.amount)}</span>
        </div>
      </div>

      {/* ── Rejection notice ── */}
      {isRejected && (
        <div className="card bg-red-50 border border-red-100">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700">Payment Rejected</p>
              <p className="text-red-600 text-sm mt-1">
                {booking.rejection_reason || 'Your payment could not be verified. Please contact us.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment form — no reference yet ── */}
      {isPending && !booking.reference_number && (
        <div className="card border border-amber-100 bg-amber-50">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-amber-600" />
            <h3 className="font-semibold text-amber-800">Make Payment</h3>
          </div>

          {/* Bank details */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-amber-100 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Transfer to</p>
            <p className="font-bold text-dark-800 text-base">{BANK.accountName}</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Account Number</p>
                <p className="font-mono font-bold text-dark-800 text-xl tracking-widest">
                  {BANK.accountNumber}
                </p>
              </div>
              <CopyButton value={BANK.accountNumber} label="Copy" />
            </div>
            <p className="text-sm text-slate-600">
              Bank: <span className="font-semibold">{BANK.bankName}</span>
            </p>
            <div className="border-t border-amber-100 pt-2 flex items-center justify-between">
              <span className="text-sm text-slate-500">Amount to transfer</span>
              <span className="font-display font-bold text-2xl text-brand-600">
                {formatCurrency(booking.amount)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {/* Reference number */}
            <div>
              <label className="label">
                Payment Reference / Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input-field font-mono"
                placeholder="e.g. FT26ABCD1234"
                value={payRef}
                onChange={e => setPayRef(e.target.value)}
                required
                maxLength={100}
              />
              <p className="text-xs text-slate-400 mt-1">
                Copy the transaction ID from your bank app or USSD confirmation SMS
              </p>
            </div>

            {/* Screenshot upload */}
            <div>
              <label className="label">
                Payment Screenshot <span className="text-slate-400 font-normal">(recommended)</span>
              </label>

              {!proofPreview ? (
                /* Drop zone */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-amber-200 hover:border-brand-400 rounded-xl p-6 text-center transition-colors bg-white/50 hover:bg-white group"
                >
                  <div className="w-12 h-12 bg-slate-50 group-hover:bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Upload size={22} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                  </div>
                  <p className="font-semibold text-slate-600 text-sm">Tap to upload screenshot</p>
                  <p className="text-slate-400 text-xs mt-1">JPEG, PNG, WebP · Max {MAX_FILE_SIZE_MB} MB</p>
                </button>
              ) : (
                /* Preview */
                <div className="relative rounded-xl overflow-hidden border-2 border-brand-200 bg-white">
                  <img
                    src={proofPreview}
                    alt="Payment proof preview"
                    className="w-full max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    aria-label="Remove screenshot"
                  >
                    <X size={14} />
                  </button>
                  <div className="px-3 py-2 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium truncate">{proofFile?.name}</p>
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={handleFileChange}
                aria-label="Upload payment screenshot"
              />

              {fileError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {fileError}
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting || !!fileError}>
              {submitting
                ? <span className="flex items-center justify-center gap-2"><RefreshCw size={16} className="animate-spin" /> Uploading & submitting…</span>
                : 'Submit Payment'}
            </button>
          </form>
        </div>
      )}

      {/* ── Payment submitted — awaiting verification ── */}
      {isPending && booking.reference_number && (
        <div className="card border border-blue-100 bg-blue-50">
          <div className="flex items-start gap-3">
            <RefreshCw size={18} className="text-blue-500 shrink-0 mt-0.5 animate-spin" />
            <div className="flex-1">
              <p className="font-semibold text-blue-700">Payment Under Review</p>
              <p className="text-blue-600 text-sm mt-1">
                Reference: <span className="font-mono font-bold">{booking.reference_number}</span>
              </p>
              <p className="text-blue-500 text-xs mt-1">
                Admin is verifying your payment. This page refreshes automatically every 15 seconds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel ── */}
      {isPending && (
        <button onClick={handleCancel} disabled={cancelling} className="btn-danger w-full">
          {cancelling ? 'Cancelling…' : 'Cancel Booking'}
        </button>
      )}
    </div>
  );
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
      <Icon size={14} className="text-slate-500" />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-dark-800">{value}</p>
    </div>
  </div>
);
