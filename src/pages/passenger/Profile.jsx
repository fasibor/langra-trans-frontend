import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Phone, Mail, LogOut, Shield } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display font-bold text-2xl text-dark-900 pt-2">My Profile</h1>

      {/* Avatar card */}
      <div className="card text-center py-8">
        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="font-display font-bold text-3xl text-brand-600">
            {user?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <h2 className="font-display font-bold text-xl text-dark-900">{user?.name}</h2>
        <span className="inline-block mt-2 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full capitalize">
          {user?.role}
        </span>
      </div>

      {/* Details */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-dark-800 text-sm">Account Details</h3>
        <ProfileRow icon={User} label="Full Name" value={user?.name} />
        <ProfileRow icon={Phone} label="Phone Number" value={user?.phone} />
        {user?.email && <ProfileRow icon={Mail} label="Email" value={user?.email} />}
        <ProfileRow icon={Shield} label="Account Type" value={user?.role === 'user' ? 'Passenger' : user?.role} />
      </div>

      {/* Actions */}
      <div className="card">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:text-red-700 font-semibold w-full py-2 transition-colors"
        >
          <LogOut size={18} />
          Sign out of account
        </button>
      </div>

      <p className="text-center text-xs text-slate-300 pb-4">Langra Trans v1.0 · Built for Lagos commuters</p>
    </div>
  );
}

const ProfileRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
      <Icon size={16} className="text-slate-500" />
    </div>
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-dark-800">{value}</p>
    </div>
  </div>
);
