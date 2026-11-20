import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Live Map', path: '/admin', icon: '🗺️' }, // We'll route this later
    { name: 'Manage Buses', path: '/admin', icon: '🚌' },
    { name: 'Manage Drivers', path: '/admin', icon: '👨‍✈️' },
  ];

  return (
    <div className="w-64 bg-[#0F172A] text-white min-h-screen flex flex-col">
      <div className="p-6 flex items-center gap-2 border-b border-gray-700">
        <span className="text-3xl">🚌</span>
        <h1 className="text-xl font-bold text-[#FBBF24]">Campus Express</h1>
      </div>

      <div className="flex-1 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              location.pathname === item.path && item.name === 'Dashboard'
                ? 'bg-[#1E3A8A] border-l-4 border-[#FBBF24]'
                : 'hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full text-left text-sm font-medium text-red-400 hover:text-red-300 transition"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  );
}