import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Home, MapPin, Clock, User, LogOut, Bell, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',     icon: Home,      label: 'Home' },
  { to: '/book',          icon: MapPin,    label: 'Book' },
  { to: '/bookings',      icon: Clock,     label: 'My Trips' },
  { to: '/announcements', icon: Megaphone, label: 'News' },
  { to: '/notifications', icon: Bell,      label: 'Alerts', badge: true },
  { to: '/profile',       icon: User,      label: 'Profile' },
];

export const PassengerLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-brand-100">
            <img src="/logo.png" alt="Langra Trans" className="w-full h-full object-contain" />
          </div>
          <span className="font-display font-bold text-dark-800 text-lg">Langra Trans</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 hidden sm:block">Hi, {user?.name?.split(' ')[0]}</span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-1" aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24 max-w-lg mx-auto w-full px-4 pt-4">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-lg z-40">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 relative ${
                  isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                    {badge && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
