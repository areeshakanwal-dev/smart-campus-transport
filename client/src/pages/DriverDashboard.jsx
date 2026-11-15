import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../api/socket';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../api/axios';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [busId, setBusId] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const socketRef = useRef(null);
  const throttleRef = useRef(0);

  // 1. Fetch the bus assigned to this driver
  useEffect(() => {
    api.get('/buses').then(({ data }) => {
      const myBus = data.find((b) => b.driver_id === user.id);
      if (myBus) setBusId(myBus.id);
    });
  }, [user.id]);

  // 2. Use the geolocation hook to track position
  useGeolocation({
    enabled: tracking,
    onUpdate: (pos) => {
      setLastPos(pos);
      const now = Date.now();
      // Throttle: only send data every 4 seconds to save battery
      if (now - throttleRef.current < 4000) return; 
      throttleRef.current = now;
      
      // Send location via Socket.io
      if (socketRef.current && busId) {
        socketRef.current.emit('driver:location', { busId, ...pos });
      }
    },
  });

  const startRoute = () => {
    if (!busId) return alert('No bus assigned. Contact admin.');
    socketRef.current = connectSocket();
    setTracking(true);
  };

  const endRoute = () => setTracking(false);

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Driver — {user.name}</h1>
      <p className="text-sm text-gray-600 mb-4">Bus ID: {busId || 'Not assigned'}</p>

      {!tracking ? (
        <button onClick={startRoute} className="w-full bg-green-600 text-white p-3 rounded">
          ▶ Start Route
        </button>
      ) : (
        <button onClick={endRoute} className="w-full bg-red-600 text-white p-3 rounded">
          ⏹ End Route
        </button>
      )}

      {lastPos && (
        <div className="mt-4 text-sm text-gray-700 bg-gray-100 p-4 rounded">
          <p><strong>Lat:</strong> {lastPos.lat.toFixed(6)}</p>
          <p><strong>Lng:</strong> {lastPos.lng.toFixed(6)}</p>
          <p><strong>Accuracy:</strong> ±{lastPos.accuracy?.toFixed(0)} m</p>
        </div>
      )}

      <button onClick={logout} className="mt-8 text-red-600 underline">
        Logout
      </button>
    </div>
  );
}