import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../api/socket';

// Fix Leaflet marker icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [busId, setBusId] = useState(null);
  const [busPos, setBusPos] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null); // <-- New state for the banner
  const socketRef = useRef(null);

  useEffect(() => {
    if (!busId) return;
    const socket = connectSocket();
    socketRef.current = socket;
    socket.emit('parent:subscribe', { busId });

    socket.on('bus:location', (data) => {
      if (data.busId === busId) {
        setBusPos({ lat: data.lat, lng: data.lng });
        setLastUpdate(new Date());
      }
    });

    // Listen for the alert
    socket.on('alert:arrival', (data) => {
      setAlertMessage(`🚌 Bus arriving at ${data.stopName} in ~${Math.round(data.distance)}m`);
      
      // Auto-hide the alert after 8 seconds
      setTimeout(() => {
        setAlertMessage(null);
      }, 8000);
    });

    return () => {
      socket.emit('parent:unsubscribe', { busId });
      socket.off('bus:location');
      socket.off('alert:arrival');
    };
  }, [busId]);

  const isStale = lastUpdate && Date.now() - lastUpdate.getTime() > 15000;

  return (
    <div className="h-screen flex flex-col relative">
      <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Parent — {user.name}</h1>
        <button onClick={logout} className="underline hover:text-gray-200">Logout</button>
      </header>

      {/* Yellow test box */}
      {!busId && (
        <div className="p-4 bg-yellow-100 border-b border-yellow-300">
          <p className="text-sm mb-2 text-yellow-800 font-bold">Test Mode: Enter a Bus ID to track</p>
          <input 
            type="text" 
            placeholder="Paste Bus UUID here..." 
            className="border p-2 rounded w-full max-w-md"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setBusId(e.target.value);
            }}
          />
        </div>
      )}

      {/* NEW: The Alert Banner */}
      {alertMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 text-lg font-bold animate-bounce">
          {alertMessage}
        </div>
      )}

      <div className="p-2 text-sm bg-gray-100 text-gray-700 flex justify-between">
        {busPos ? (
          <>
            <span>Tracking Bus: {busId.substring(0, 8)}...</span>
            <span>
              Last update: {lastUpdate?.toLocaleTimeString()}
              {isStale && <span className="text-red-600 ml-2 font-bold">⚠ Data is stale</span>}
            </span>
          </>
        ) : (
          <span>Waiting for bus data...</span>
        )}
      </div>

      <MapContainer center={busPos || [33.6844, 73.0479]} zoom={15} style={{ flex: 1 }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {busPos && (
          <Marker 
            position={[busPos.lat, busPos.lng]} 
            icon={L.icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })}
          >
            <Popup>Your bus is here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}