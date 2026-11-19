import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Fix Leaflet marker icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch live buses every 5 seconds
  useEffect(() => {
    const fetchBuses = () => {
      api.get('/buses/live')
        .then(({ data }) => {
          setBuses(data);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    };

    fetchBuses(); // fetch immediately
    const interval = setInterval(fetchBuses, 5000); // fetch every 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 bg-gray-900 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Fleet Map</h1>
        <div>
          <span className="mr-4 text-sm text-gray-300">Logged in as {user.name}</span>
          <button onClick={logout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">Logout</button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar with bus list */}
        <div className="w-64 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
          <h2 className="font-bold text-lg mb-4">Active Buses ({buses.length})</h2>
          {loading ? (
            <p>Loading...</p>
          ) : buses.length === 0 ? (
            <p className="text-gray-500">No active buses.</p>
          ) : (
            <ul className="space-y-3">
              {buses.map((bus) => (
                <li key={bus.id} className="bg-white p-3 rounded shadow text-sm border-l-4 border-blue-500">
                  <p className="font-bold">{bus.bus_number}</p>
                  <p className="text-gray-600">Driver: {bus.driver_name || 'Unassigned'}</p>
                  <p className={`text-xs mt-1 ${bus.lat ? 'text-green-600' : 'text-red-500'}`}>
                    {bus.lat ? '🟢 Live' : '🔴 Offline'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* The Map */}
        <MapContainer center={[33.6844, 73.0479]} zoom={12} style={{ flex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          {buses.map((bus) => (
            bus.lat && bus.lng && (
              <Marker key={bus.id} position={[bus.lat, bus.lng]}>
                <Popup>
                  <strong>{bus.bus_number}</strong><br />
                  Driver: {bus.driver_name || 'Unassigned'}
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
    </div>
  );
}