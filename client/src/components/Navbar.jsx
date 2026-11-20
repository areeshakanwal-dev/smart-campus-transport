import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // Don't show navbar if not logged in

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold tracking-wider text-blue-400">
              🚌 SmartCampus
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Admin Dashboard</Link>
              )}
              {user.role === 'driver' && (
                <Link to="/driver" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Driver Dashboard</Link>
              )}
              {user.role === 'parent' && (
                <Link to="/parent" className="hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition">Parent Map</Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Logged in as <strong className="text-white">{user.name}</strong></span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}