import { useEffect, useState } from "react";
import AdminSidebar from '../components/AdminSidebar';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Fix Leaflet default icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom red icon for stops
const stopIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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
  const [stopName, setStopName] = useState("");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);

  // Fetch data
  const fetchData = () => {
    Promise.all([
      api.get("/buses/live"),
      api.get("/buses/stops"),
      api.get("/buses/analytics"), // <-- Add this
    ])
      .then(([busesRes, stopsRes, analyticsRes]) => {
        setBuses(busesRes.data);
        setStops(stopsRes.data);
        setAnalytics(analyticsRes.data); // <-- Add this
        setLoading(false);
      })
      .catch(console.error);
  };
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMapClick = (latlng) => {
    setNewStop(latlng);
    setStopName("");
  };

  const saveStop = () => {
    if (!stopName) return alert("Please enter a stop name");
    api
      .post("/buses/stops", {
        name: stopName,
        lat: newStop.lat,
        lng: newStop.lng,
      })
      .then(() => {
        setNewStop(null);
        fetchData(); // Refresh stops
      })
      .catch((err) =>
        alert(err.response?.data?.message || "Error saving stop"),
      );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header inside the dashboard */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Admin User</span>
            <div className="w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold">A</div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left Column: Stats and Chart */}
          <div className="w-80 flex flex-col gap-6">
            
            {/* Quick Stats */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-3">Active Buses</h2>
              <div className="text-3xl font-extrabold text-[#1E3A8A]">{buses.length}</div>
            </div>

            {/* Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
              <h2 className="font-bold text-gray-800 mb-4">Weekly Boarding</h2>
              <div style={{ height: '250px' }}>
                {analytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics}>
                      <XAxis dataKey="date" tick={{fontSize: 10}} />
                      <YAxis tick={{fontSize: 10}} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-center text-gray-500 mt-8">No data yet.</p>
                )}
              </div>
            </div>

            {/* Stops List */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64 overflow-y-auto">
              <h2 className="font-bold text-gray-800 mb-3">Stops ({stops.length})</h2>
              <ul className="space-y-2">
                {stops.map((stop) => (
                  <li key={stop.id} className="text-sm p-2 bg-gray-50 rounded border border-gray-200">
                    📍 {stop.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
            <MapContainer center={[33.6844, 73.0479]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {buses.map((bus) => (
                bus.lat && bus.lng && (
                  <Marker key={`bus-${bus.id}`} position={[bus.lat, bus.lng]}>
                    <Popup>Bus: {bus.bus_number}</Popup>
                  </Marker>
                )
              ))}
              {stops.map((stop) => (
                <Marker key={`stop-${stop.id}`} position={[stop.lat, stop.lng]} icon={stopIcon}>
                  <Popup>Stop: {stop.name}</Popup>
                </Marker>
              ))}
              {newStop && (
                <Marker position={[newStop.lat, newStop.lng]} icon={stopIcon} />
              )}
            </MapContainer>

            {/* Floating Add Stop Form */}
            {newStop && (
              <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-xl border border-gray-200 w-64">
                <p className="text-sm font-bold mb-2 text-gray-700">New Stop</p>
                <input 
                  type="text" 
                  placeholder="Stop Name" 
                  value={stopName}
                  onChange={(e) => setStopName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded mb-2 text-sm focus:ring-2 focus:ring-[#1E3A8A] outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={saveStop} className="bg-[#1E3A8A] text-white text-xs px-3 py-1.5 rounded flex-1">Save</button>
                  <button onClick={() => setNewStop(null)} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded flex-1">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
