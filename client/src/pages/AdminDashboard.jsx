import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// Fix Leaflet default icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red icon for stops
const stopIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [newStop, setNewStop] = useState(null); // { lat, lng }
  const [stopName, setStopName] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = () => {
    Promise.all([
      api.get('/buses/live'),
      api.get('/buses/stops')
    ]).then(([busesRes, stopsRes]) => {
      setBuses(busesRes.data);
      setStops(stopsRes.data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMapClick = (latlng) => {
    setNewStop(latlng);
    setStopName('');
  };

  const saveStop = () => {
    if (!stopName) return alert('Please enter a stop name');
    api.post('/buses/stops', { name: stopName, lat: newStop.lat, lng: newStop.lng })
      .then(() => {
        setNewStop(null);
        fetchData(); // Refresh stops
      })
      .catch((err) => alert(err.response?.data?.message || 'Error saving stop'));
  };

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
        {/* Sidebar */}
        <div className="w-72 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
          <h2 className="font-bold text-lg mb-2">Active Buses ({buses.length})</h2>
          <ul className="space-y-2 mb-6">
            {buses.map((bus) => (
              <li key={bus.id} className="bg-white p-2 rounded shadow text-sm border-l-4 border-blue-500">
                <p className="font-bold">{bus.bus_number}</p>
                <p className={`text-xs ${bus.lat ? 'text-green-600' : 'text-red-500'}`}>
                  {bus.lat ? '🟢 Live' : '🔴 Offline'}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="font-bold text-lg mb-2">Stops ({stops.length})</h2>
          <p className="text-xs text-gray-500 mb-2">Click on the map to add a new stop.</p>
          
          {newStop && (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-300 mb-4">
              <p className="text-sm font-bold mb-2">New Stop at {newStop.lat.toFixed(4)}, {newStop.lng.toFixed(4)}</p>
              <input 
                type="text" 
                placeholder="Stop Name (e.g. Library)" 
                value={stopName}
                onChange={(e) => setStopName(e.target.value)}
                className="w-full p-1 border rounded text-sm mb-2"
              />
              <div className="flex gap-2">
                <button onClick={saveStop} className="bg-green-600 text-white text-xs px-2 py-1 rounded">Save</button>
                <button onClick={() => setNewStop(null)} className="bg-gray-300 text-xs px-2 py-1 rounded">Cancel</button>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {stops.map((stop) => (
              <li key={stop.id} className="bg-white p-2 rounded shadow text-sm border-l-4 border-red-500">
                <p className="font-bold">{stop.name}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Map */}
        <MapContainer center={[33.6844, 73.0479]} zoom={13} style={{ flex: 1 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          <MapClickHandler onMapClick={handleMapClick} />

          {/* Render Buses */}
          {buses.map((bus) => (
            bus.lat && bus.lng && (
              <Marker key={`bus-${bus.id}`} position={[bus.lat, bus.lng]}>
                <Popup>Bus: {bus.bus_number}</Popup>
              </Marker>
            )
          ))}

          {/* Render Stops */}
          {stops.map((stop) => (
            <Marker key={`stop-${stop.id}`} position={[stop.lat, stop.lng]} icon={stopIcon}>
              <Popup>Stop: {stop.name}</Popup>
            </Marker>
          ))}

          {/* Render New Stop Marker */}
          {newStop && (
            <Marker position={[newStop.lat, newStop.lng]} icon={stopIcon} />
          )}
        </MapContainer>
      </div>
    </div>
  );
}