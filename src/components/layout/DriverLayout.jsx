import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Truck, ScanLine, ClipboardList, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/driver', icon: Truck, label: 'My Trips', exact: true },
  { to: '/driver/validate', icon: ScanLine, label: 'Scan / Validate' },
];

export const DriverLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-dark-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-slate-600">
            <img src="/logo.png" alt="Langra Trans" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-display font-bold text-white text-base">Langra Trans</span>
            <span className="text-xs text-slate-400 ml-2">Driver Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300 hidden sm:block">{user?.name}</span>
          <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24 max-w-lg mx-auto w-full px-4 pt-4">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-dark-700 z-40">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
