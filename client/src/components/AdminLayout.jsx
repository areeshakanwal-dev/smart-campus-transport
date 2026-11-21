import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard Overview', end: true },
  { to: '/admin/live-fleet', label: 'Live Fleet Tracking' },
  { to: '/admin/buses', label: 'Bus Management' },
  { to: '/admin/drivers', label: 'Driver Management' },
  { to: '/admin/students', label: 'Student Management' },
  { to: '/admin/parents', label: 'Parent Management' },
  { to: '/admin/routes', label: 'Routes & Stops' },
  { to: '/admin/boarding', label: 'Boarding Logs' },
  { to: '/admin/alerts', label: 'Alerts & Notifications' },
  { to: '/admin/reports', label: 'Reports & Analytics' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 bg-[#0f172a] text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🚌 CampusTrack <span className="text-sm block text-blue-300">Admin</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow px-6 py-3 flex items-center justify-between">
          <div className="text-gray-600">Welcome back, {user?.name}</div>
          <div className="flex items-center gap-4">
            <input
              placeholder="Search..."
              className="border rounded px-3 py-1 text-sm"
            />
            <button className="text-xl">🔔</button>
            <button className="text-xl">⚙️</button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded text-sm">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}