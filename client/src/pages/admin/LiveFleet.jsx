import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../api/axios'; // 2 steps back to src
import { connectSocket } from '../../api/socket'; // 2 steps back to src

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to auto-zoom to buses when first loaded
function MapUpdater({ buses }) {
  const map = useMap();
  useEffect(() => {
    const validBuses = Object.values(buses).filter(b => b.lat && b.lng);
    if (validBuses.length > 0) {
      const bounds = L.latLngBounds(validBuses.map(b => [b.lat, b.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [buses]); // Added buses dependency so it zooms when first bus arrives
  return null;
}

export default function LiveFleet() {
  const [buses, setBuses] = useState({}); // Object keyed by busId
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial locations from DB
    api.get('/buses/live').then(({ data }) => {
      const busMap = {};
      data.forEach(b => {
        busMap[b.bus_id] = {
          id: b.bus_id,
          lat: parseFloat(b.lat),
          lng: parseFloat(b.lng),
          speed: b.speed,
          accuracy: b.accuracy,
          lastUpdate: new Date(b.recorded_at).getTime(),
        };
      });
      setBuses(busMap);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load live locations", err);
      setLoading(false);
    });

    // 2. Connect to Socket.IO for real-time updates
    const socket = connectSocket();
    socketRef.current = socket;
    
    // Join the admin room
    socket.emit('admin:subscribe');

    // Listen for updates
    socket.on('bus:location', (data) => {
      setBuses(prev => ({
        ...prev,
        [data.busId]: {
          id: data.busId,
          lat: data.lat,
          lng: data.lng,
          speed: data.speed,
          accuracy: data.accuracy,
          lastUpdate: data.timestamp,
        }
      }));
    });

    return () => {
      socket.off('bus:location');
    };
  }, []);

  // Helper to determine status based on time since last update
  const getBusStatus = (lastUpdate) => {
    if (!lastUpdate) return { text: 'Offline', color: 'bg-gray-400' };
    const diff = Date.now() - lastUpdate;
    if (diff < 15000) return { text: 'Active', color: 'bg-green-500' }; // < 15 secs
    if (diff < 60000) return { text: 'Stopped', color: 'bg-yellow-500' }; // < 1 min
    return { text: 'Offline', color: 'bg-red-500' }; // > 1 min
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* MAP SECTION (Left 70%) */}
      <div className="flex-1 rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-white relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
            <p className="text-gray-500">Loading fleet data...</p>
          </div>
        ) : Object.keys(buses).length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-50">
            <p className="text-gray-500">No buses are currently reporting their location.</p>
          </div>
        ) : null}

        <MapContainer 
          center={[33.6844, 73.0479]} // Default to Islamabad, changes when buses load
          zoom={12} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          
          <MapUpdater buses={buses} />

          {Object.values(buses).map((bus) => {
            const status = getBusStatus(bus.lastUpdate);
            return (
              <Marker 
                key={bus.id} 
                position={[bus.lat, bus.lng]}
                opacity={status.text === 'Offline' ? 0.5 : 1}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-sm border-b pb-1 mb-1">Bus: {bus.id.slice(0, 8)}...</p>
                    <p className="text-xs text-gray-600">Speed: {bus.speed ? Math.round(bus.speed) : 0} km/h</p>
                    <p className="text-xs text-gray-600">Accuracy: ±{bus.accuracy ? Math.round(bus.accuracy) : '?'} m</p>
                    <p className="text-xs text-gray-600">Status: <span className={`inline-block w-2 h-2 rounded-full ${status.color} mr-1`}></span>{status.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(bus.lastUpdate).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* SIDE PANEL (Right 30%) */}
      <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-800">Active Fleet</h2>
          <p className="text-xs text-gray-500">{Object.keys(buses).length} buses tracked</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {Object.values(buses).map((bus) => {
            const status = getBusStatus(bus.lastUpdate);
            return (
              <div key={bus.id} className="p-3 border rounded hover:bg-gray-50 transition cursor-default">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">{bus.id.slice(0, 8)}...</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded text-white ${status.color}`}>
                    {status.text}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>Speed: {bus.speed ? Math.round(bus.speed) : 0} km/h</span>
                  <span>{new Date(bus.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}