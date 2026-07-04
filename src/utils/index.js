export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-NG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const formatDateTime = (dateStr, timeStr) => {
  return `${formatDate(dateStr)} at ${formatTime(timeStr)}`;
};

export const getStatusBadgeClass = (status) => {
  const map = {
    CONFIRMED: 'badge-confirmed',
    PENDING_PAYMENT: 'badge-pending',
    PENDING: 'badge-pending',
    REJECTED: 'badge-rejected',
    BOARDED: 'badge-boarded',
    CANCELLED: 'badge-cancelled',
  };
  return map[status] || 'badge-pending';
};

export const getStatusLabel = (status) => {
  const map = {
    CONFIRMED: 'Confirmed',
    PENDING_PAYMENT: 'Awaiting Payment',
    PENDING: 'Pending',
    REJECTED: 'Rejected',
    BOARDED: 'Boarded',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status;
};

export const isUpcoming = (dateStr) => {
  const tripDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return tripDate >= today;
};

export const getErrorMessage = (error) => {
  return error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    error?.message ||
    'Something went wrong. Please try again.';
};
