import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lt_token');
      localStorage.removeItem('lt_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────
export const authAPI = {
  register:          (data)          => api.post('/auth/register', data),
  login:             (data)          => api.post('/auth/login', data),
  loginPin:          (data)          => api.post('/auth/login-pin', data),
  getMe:             ()              => api.get('/auth/me'),
  forgotPassword:    (data)          => api.post('/auth/forgot-password', data),
  resetPassword:     (data)          => api.post('/auth/reset-password', data),
  verifyResetToken:  (token)         => api.get('/auth/verify-reset-token', { params: { token } }),
};

// ── Routes ──────────────────────────────────────────────────────
export const routesAPI = {
  getAll:     ()         => api.get('/routes'),
  getAllAdmin: ()         => api.get('/admin/routes'),
  create:     (data)     => api.post('/routes', data),
  update:     (id, data) => api.put(`/routes/${id}`, data),
  remove:     (id)       => api.delete(`/routes/${id}`),
};

// ── Trips ───────────────────────────────────────────────────────
export const tripsAPI = {
  getAvailable:   (params)   => api.get('/trips', { params }),
  getById:        (id)       => api.get(`/trips/${id}`),
  getAllAdmin:     (params)   => api.get('/admin/trips', { params }),
  create:         (data)     => api.post('/trips', data),
  update:         (id, data) => api.put(`/trips/${id}`, data),
  getManifest:    (id)       => api.get(`/trips/${id}/manifest`),
  getDriverTrips: ()         => api.get('/driver/trips'),
  getLocation:    (id)       => api.get(`/trips/${id}/location`),
  toggleTracking: (id, data) => api.patch(`/admin/trips/${id}/tracking`, data),
  postLocation:   (id, data) => api.post(`/driver/trips/${id}/location`, data),
  signalArrival:  (id, data) => api.post(`/driver/trips/${id}/arrived`, data),
};

// ── Bookings ────────────────────────────────────────────────────
export const bookingsAPI = {
  create:     (data)         => api.post('/bookings', data),
  getMine:    (params)       => api.get('/bookings', { params }),
  getById:    (id)           => api.get(`/bookings/${id}`),
  cancel:     (id)           => api.patch(`/bookings/${id}/cancel`),
  getAllAdmin: (params)       => api.get('/admin/bookings', { params }),
  getDashboard: ()           => api.get('/admin/dashboard'),
};

// ── Payments ────────────────────────────────────────────────────
export const paymentsAPI = {
  submit: (bookingId, referenceNumber, proofImage = null) => {
    const form = new FormData();
    form.append('booking_id', bookingId);
    form.append('reference_number', referenceNumber);
    if (proofImage) form.append('proof_image', proofImage);
    return api.post('/payments', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getPending:  ()          => api.get('/admin/payments/pending'),
  verify:      (id, data)  => api.post(`/admin/payments/${id}/verify`, data),
};

// ── Admin helpers ────────────────────────────────────────────────
export const adminAPI = {
  getDrivers:        ()         => api.get('/admin/drivers'),
  createDriver:      (data)     => api.post('/admin/drivers', data),
  toggleDriverStatus:(id)       => api.patch(`/admin/drivers/${id}/toggle`),
};

// ── Boarding ────────────────────────────────────────────────────
export const boardingAPI = {
  validate: (booking_code) => api.post('/boarding/validate', { booking_code }),
};

// ── Announcements ───────────────────────────────────────────────
export const announcementsAPI = {
  getAll:   (params)     => api.get('/announcements', { params }),
  create:   (data)       => api.post('/announcements', data),
  update:   (id, data)   => api.put(`/announcements/${id}`, data),
  remove:   (id)         => api.delete(`/announcements/${id}`),
  markRead: (id)         => api.post(`/announcements/${id}/read`),
};

// ── Notifications ───────────────────────────────────────────────
export const notificationsAPI = {
  getAll:      (params) => api.get('/notifications', { params }),
  markRead:    (id)     => api.patch(`/notifications/${id}/read`),
  markAllRead: ()       => api.patch('/notifications/read-all'),
  streamUrl:   ()       => `${API_BASE_URL}/notifications/stream`,
};

// ── Settings ────────────────────────────────────────────────────
export const settingsAPI = {
  get:                 ()       => api.get('/settings'),
  updateNotifications: (data)   => api.patch('/settings/notifications', data),
  setPin:              (data)   => api.post('/settings/pin/set', data),
  disablePin:          ()       => api.post('/settings/pin/disable'),
};

export default api;
