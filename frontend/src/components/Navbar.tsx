import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Dumbbell, User, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'COACH' ? '/coach' : '/client';

  return (
    <nav className="bg-navy-800 border-b border-navy-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <Dumbbell className="text-gold-500 w-7 h-7" />
        <span className="font-display text-2xl font-bold text-white tracking-wider">
          Y<span className="text-gold-500">buddy</span>
        </span>
      </Link>

      {user && (
        <div className="flex items-center gap-4">
          <Link to={dashboardPath} className="flex items-center gap-1.5 text-gray-300 hover:text-gold-400 transition-colors text-sm">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-700 rounded-lg">
            {user.role === 'ADMIN' ? <Shield className="w-4 h-4 text-gold-500" /> : <User className="w-4 h-4 text-gold-500" />}
            <span className="text-sm text-gray-300">{user.name || user.email}</span>
            <span className="badge-gold text-xs">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
