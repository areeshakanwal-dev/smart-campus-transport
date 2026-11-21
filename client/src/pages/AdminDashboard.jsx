import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Sidebar Links
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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for stats and activities
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  // Only fetch stats if we are on the main dashboard page
  useEffect(() => {
    if (location.pathname === '/admin') {
      api.get('/admin/stats').then((r) => setStats(r.data)).catch(console.error);
      api.get('/admin/activities').then((r) => setActivities(r.data)).catch(console.error);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cards = [
    { label: 'Total Buses', value: stats?.totalBuses ?? '–' },
    { label: 'Total Drivers', value: stats?.totalDrivers ?? '–' },
    { label: 'Total Students', value: stats?.totalStudents ?? '–' },
    { label: 'Active Buses', value: stats?.activeBuses ?? '–' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f172a] text-white flex flex-col fixed h-full z-10">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          🚌 CampusTrack
          <span className="text-sm block text-blue-300 font-normal mt-1">Admin Panel</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="bg-white shadow px-6 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="text-gray-600">Welcome back, <span className="font-semibold text-gray-900">{user?.name}</span></div>
          <div className="flex items-center gap-4">
            <input placeholder="Search..." className="border rounded px-3 py-1 text-sm bg-gray-50" />
            <button className="text-xl hover:text-blue-600">🔔</button>
            <button className="text-xl hover:text-blue-600">⚙️</button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700">
              Logout
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-auto">
          {/* If we are at /admin, show the dashboard content */}
          {location.pathname === '/admin' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {cards.map((c) => (
                  <div key={c.label} className="bg-white p-5 rounded-xl shadow border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">{c.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{c.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white p-5 rounded-xl shadow border">
                  <h2 className="font-semibold mb-3">Recent Activities</h2>
                  <ul className="text-sm space-y-2">
                    {activities.length === 0 && <li className="text-gray-400">No activities yet.</li>}
                    {activities.map((a, i) => (
                      <li key={i} className="flex justify-between border-b pb-2">
                        <span className="capitalize text-gray-700">{a.type.replace('_', ' ')}: {a.detail}</span>
                        <span className="text-gray-400 text-xs">{new Date(a.created_at).toLocaleTimeString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl shadow border">
                  <h2 className="font-semibold mb-3">Quick Actions</h2>
                  <div className="space-y-2">
                    <Link to="/admin/buses" className="block bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition">➕ Add New Bus</Link>
                    <Link to="/admin/drivers" className="block bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition">➕ Register Driver</Link>
                    <Link to="/admin/students" className="block bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition">➕ Register Student</Link>
                    <Link to="/admin/routes" className="block bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition">➕ Create Route</Link>
                    <Link to="/admin/live-fleet" className="block bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition">🗺️ View Live Map</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NESTED ROUTES WILL RENDER HERE (e.g., /admin/buses, /admin/live-fleet) */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}