import { lazy, Suspense } from 'react';
import { useOnline } from './hooks/useOnline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, PublicRoute } from './components/layout/ProtectedRoute';
import { PassengerLayout } from './components/layout/PassengerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { DriverLayout } from './components/layout/DriverLayout';
import { ErrorBoundary, PageLoader } from './components/ui/index.jsx';

// ── Code splitting: each role's bundle loads only when needed ──────────────
// A passenger never downloads the admin or driver JS bundle.
// An admin never downloads the passenger booking UI.

// Public pages — small, load eagerly
import Landing  from './pages/Landing';
import Login    from './pages/Login';
import Register from './pages/Register';

// Passenger pages — lazy loaded
const Dashboard      = lazy(() => import('./pages/passenger/Dashboard'));
const BookRide       = lazy(() => import('./pages/passenger/BookRide'));
const BookingHistory = lazy(() => import('./pages/passenger/BookingHistory'));
const BookingDetail  = lazy(() => import('./pages/passenger/BookingDetail'));
const Profile        = lazy(() => import('./pages/passenger/Profile'));

// Admin pages — lazy loaded (separate chunk)
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const RouteManagement   = lazy(() => import('./pages/admin/RouteManagement'));
const TripManagement    = lazy(() => import('./pages/admin/TripManagement'));
const PaymentVerification = lazy(() => import('./pages/admin/PaymentVerification'));
const AdminBookings     = lazy(() => import('./pages/admin/AdminBookings'));

// Passenger extras
const Announcements  = lazy(() => import('./pages/passenger/Announcements'));
const BusTracking    = lazy(() => import('./pages/passenger/BusTracking'));
const Notifications  = lazy(() => import('./pages/passenger/Notifications'));
const Settings       = lazy(() => import('./pages/passenger/Settings'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));

// Admin extras
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));

// Driver pages — lazy loaded (separate chunk)
const DriverTrips     = lazy(() => import('./pages/driver/DriverTrips'));
const ValidateBooking = lazy(() => import('./pages/driver/ValidateBooking'));
const DriverManifest  = lazy(() => import('./pages/driver/DriverManifest'));

// Layout wrappers
const PassengerPage = ({ children }) => (
  <ProtectedRoute roles={['user']}>
    <PassengerLayout>{children}</PassengerLayout>
  </ProtectedRoute>
);

const AdminPage = ({ children }) => (
  <ProtectedRoute roles={['admin']}>
    <AdminLayout>{children}</AdminLayout>
  </ProtectedRoute>
);

const DriverPage = ({ children }) => (
  <ProtectedRoute roles={['driver', 'admin']}>
    <DriverLayout>{children}</DriverLayout>
  </ProtectedRoute>
);


// Lightweight offline banner — shown only when navigator.onLine is false
function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[9999] bg-slate-900 text-white text-center text-sm font-medium py-2 px-4"
    >
      📡 You appear to be offline. Some features may not work until you reconnect.
    </div>
  );
}

export default function App() {
  return (
    // Top-level ErrorBoundary catches any unhandled JS errors in the tree
    <ErrorBoundary>
      <OfflineBanner />
      <AuthProvider>
        <NotificationProvider>
        <Router>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          {/* Suspense boundary shows PageLoader while lazy chunks load */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Passenger */}
              <Route path="/dashboard"      element={<PassengerPage><Dashboard /></PassengerPage>} />
              <Route path="/book"           element={<PassengerPage><BookRide /></PassengerPage>} />
              <Route path="/bookings"       element={<PassengerPage><BookingHistory /></PassengerPage>} />
              <Route path="/bookings/:id"   element={<PassengerPage><BookingDetail /></PassengerPage>} />
              <Route path="/profile"        element={<PassengerPage><Profile /></PassengerPage>} />
              <Route path="/announcements"  element={<PassengerPage><Announcements /></PassengerPage>} />
              <Route path="/notifications"  element={<PassengerPage><Notifications /></PassengerPage>} />
              <Route path="/settings"       element={<PassengerPage><Settings /></PassengerPage>} />
              <Route path="/tracking/:id"  element={<BusTracking />} />

              {/* Admin */}
              <Route path="/admin"           element={<AdminPage><AdminDashboard /></AdminPage>} />
              <Route path="/admin/routes"    element={<AdminPage><RouteManagement /></AdminPage>} />
              <Route path="/admin/trips"     element={<AdminPage><TripManagement /></AdminPage>} />
              <Route path="/admin/payments"  element={<AdminPage><PaymentVerification /></AdminPage>} />
              <Route path="/admin/bookings"       element={<AdminPage><AdminBookings /></AdminPage>} />
              <Route path="/admin/announcements"  element={<AdminPage><AdminAnnouncements /></AdminPage>} />

              {/* Driver */}
              <Route path="/driver"                    element={<DriverPage><DriverTrips /></DriverPage>} />
              <Route path="/driver/validate"           element={<DriverPage><ValidateBooking /></DriverPage>} />
              <Route path="/driver/manifest/:tripId"   element={<DriverPage><DriverManifest /></DriverPage>} />

              {/* Password recovery */}
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-password"  element={<ResetPassword />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
