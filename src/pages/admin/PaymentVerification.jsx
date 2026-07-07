import { useState } from 'react';
import { paymentsAPI } from '../../api';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatTime, formatCurrency, getErrorMessage } from '../../utils';
import { Modal, CardSkeleton, ErrorState } from '../../components/ui/index.jsx';
import toast from 'react-hot-toast';
import {
  CreditCard, CheckCircle, XCircle, RefreshCw,
  AlertCircle, ImageIcon, ExternalLink,
} from 'lucide-react';

export default function PaymentVerification() {
  const [processing,    setProcessing]   = useState(null);
  const [rejectModal,   setRejectModal]  = useState(null);
  const [approveTarget, setApproveTarget] = useState(null); // { id, passenger, amount }
  const [rejectReason,  setRejectReason] = useState('');
  const [lightbox,      setLightbox]     = useState(null); // proof image URL

  const { data, loading, error, refetch } = useAsync(
    () => paymentsAPI.getPending(),
    []
  );

  const payments = data?.payments || [];

  // handleApprove is now replaced by setApproveTarget + confirmApprove modal flow

  const confirmApprove = async () => {
    if (!approveTarget) return;
    const { id: paymentId } = approveTarget;
    setApproveTarget(null);
    setProcessing(paymentId);
    try {
      const res = await paymentsAPI.verify(paymentId, { action: 'approve' });
      toast.success(`✅ Approved! Booking code: ${res.data.booking_code}`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      toast.error('Please enter a rejection reason (at least 5 characters).');
      return;
    }
    setProcessing(rejectModal.payment_id);
    try {
      await paymentsAPI.verify(rejectModal.payment_id, {
        action: 'reject',
        rejection_reason: rejectReason.trim(),
      });
      toast.success('Payment rejected and booking cancelled.');
      setRejectModal(null);
      setRejectReason('');
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessing(null);
    }
  };

  const closeRejectModal = () => {
    if (processing) return;
    setRejectModal(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-dark-900">Payment Verification</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading
              ? 'Loading…'
              : `${payments.length} payment${payments.length !== 1 ? 's' : ''} awaiting verification`}
          </p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 border border-slate-200 rounded-xl px-4 py-2 transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={3} height="h-56" />
      ) : error ? (
        <ErrorState message="Failed to load pending payments." onRetry={refetch} />
      ) : payments.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h3 className="font-semibold text-dark-800 mb-1">All caught up!</h3>
          <p className="text-slate-400 text-sm">No payments pending verification</p>
        </div>
      ) : (
        <div className="space-y-5">
          {payments.map(payment => (
            <div key={payment.id} className="card border border-amber-100 bg-amber-50/20 space-y-4">

              {/* Passenger info + status */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className="badge-pending mb-1 inline-block">Pending</span>
                  <h3 className="font-bold text-dark-800 text-lg leading-tight">{payment.passenger_name}</h3>
                  <p className="text-slate-500 text-sm">{payment.passenger_phone}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted {new Date(payment.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="font-display font-bold text-2xl text-brand-600">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              {/* Trip details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white rounded-xl p-3 border border-slate-100">
                <Detail label="Route"    value={payment.route_name} />
                <Detail label="Trip"     value={`${formatTime(payment.departure_time)} · ${formatDate(payment.travel_date)}`} />
                <Detail label="Pickup"   value={payment.pickup_location} />
                <Detail label="Drop-off" value={payment.dropoff_location} />
              </div>

              {/* Payment reference + proof screenshot — side by side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Reference number */}
                <div className="bg-white border-2 border-brand-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={16} className="text-brand-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payment Reference</p>
                  </div>
                  <p className="font-display font-bold text-dark-800 text-lg break-all tracking-wide">
                    {payment.reference_number}
                  </p>

                  {/* Amount comparison */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Expected fare</span>
                      <span className="font-bold text-dark-800">{formatCurrency(payment.expected_amount)}</span>
                    </div>
                    {payment.amount_received != null && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Amount received</span>
                          <span className={`font-bold ${
                            payment.payment_flag === 'UNDERPAID' ? 'text-red-600' :
                            payment.payment_flag === 'OVERPAID'  ? 'text-amber-600' : 'text-emerald-600'
                          }`}>{formatCurrency(payment.amount_received)}</span>
                        </div>
                        {payment.payment_flag && payment.payment_flag !== 'EXACT' && (
                          <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg mt-1 ${
                            payment.payment_flag === 'UNDERPAID' ? 'bg-red-50 text-red-700' :
                            payment.payment_flag === 'OVERPAID'  ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'
                          }`}>
                            {payment.payment_flag === 'UNDERPAID' && '⚠ Underpaid by ' + formatCurrency(payment.expected_amount - payment.amount_received)}
                            {payment.payment_flag === 'OVERPAID'  && '⚠ Overpaid by '  + formatCurrency(payment.amount_received - payment.expected_amount)}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    Verify this reference in your GTBank portal before approving
                  </p>
                </div>

                {/* Proof screenshot */}
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon size={16} className="text-slate-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payment Screenshot</p>
                  </div>

                  {payment.proof_image_url ? (
                    <div className="space-y-2">
                      {/* Thumbnail — click to enlarge */}
                      <button
                        type="button"
                        onClick={() => setLightbox(payment.proof_image_url)}
                        className="w-full rounded-xl overflow-hidden border border-slate-100 hover:opacity-90 transition-opacity block"
                        aria-label="View full screenshot"
                      >
                        <img
                          src={payment.proof_image_url}
                          alt="Payment proof screenshot"
                          className="w-full max-h-36 object-contain bg-slate-50"
                          loading="lazy"
                        />
                      </button>
                      <a
                        href={payment.proof_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                      >
                        <ExternalLink size={11} /> Open full image
                      </a>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-slate-300">
                      <ImageIcon size={28} />
                      <p className="text-xs text-slate-400 mt-2">No screenshot provided</p>
                      <p className="text-xs text-slate-300">Verify reference manually</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs">
                  Always cross-check the reference number in your GTBank portal before approving.
                  Approving generates the passenger's QR boarding ticket immediately.
                </p>
              </div>

              {/* Approve / Reject */}
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal({ payment_id: payment.id, passenger: payment.passenger_name })}
                  disabled={!!processing}
                  className="btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject
                </button>
                <button
                  onClick={() => setApproveTarget({ id: payment.id, passenger: payment.passenger_name, amount: payment.amount })}
                  disabled={!!processing}
                  className="flex-1 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing === payment.id
                    ? <><RefreshCw size={18} className="animate-spin" /> Processing…</>
                    : <><CheckCircle size={18} /> Approve &amp; Confirm</>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Approve confirm modal ── */}
      <Modal
        open={!!approveTarget}
        onClose={() => !processing && setApproveTarget(null)}
        title="Approve Payment"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
            <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-700 text-sm">Confirm approval for:</p>
              <p className="text-emerald-600 text-sm font-bold mt-0.5">{approveTarget?.passenger}</p>
              <p className="text-emerald-500 text-xs mt-0.5">{formatCurrency(approveTarget?.amount || 0)}</p>
              <p className="text-emerald-600 text-xs mt-2">This will generate a booking code and QR ticket for the passenger immediately.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setApproveTarget(null)} disabled={!!processing} className="btn-secondary flex-1">Cancel</button>
            <button onClick={confirmApprove} disabled={!!processing}
              className="flex-1 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50">
              {processing ? 'Processing…' : 'Confirm Approve'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Rejection reason modal ── */}
      <Modal
        open={!!rejectModal}
        onClose={closeRejectModal}
        title="Reject Payment"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-slate-500 text-sm">
            Rejecting payment for <strong className="text-dark-800">{rejectModal?.passenger}</strong>.
            This cancels the booking and restores the seat.
          </p>
          <div>
            <label className="label">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="e.g. Reference number not found in bank records"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              maxLength={500}
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1">{rejectReason.length}/500 · min 5 characters</p>
          </div>
          <div className="flex gap-3">
            <button onClick={closeRejectModal} disabled={!!processing} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!!processing || rejectReason.trim().length < 5}
              className="btn-danger flex-1"
            >
              {processing ? 'Rejecting…' : 'Confirm Reject'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Screenshot lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Payment screenshot full view"
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <XCircle size={22} />
          </button>
          <img
            src={lightbox}
            alt="Payment proof full size"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium">{label}</p>
    <p className="text-sm font-semibold text-dark-800 leading-tight">{value}</p>
  </div>
);
