import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../api/socket';
import { useGeolocation } from '../hooks/useGeolocation';
import api from '../api/axios';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [busId, setBusId] = useState(null);
  const [students, setStudents] = useState([]);
  const [tracking, setTracking] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [boarded, setBoarded] = useState({}); // Keeps track of who is boarded
  const socketRef = useRef(null);
  const throttleRef = useRef(0);

  useEffect(() => {
    // 1. Fetch the driver's bus
    api.get('/buses').then(({ data }) => {
      const myBus = data.find((b) => b.driver_id === user.id);
      if (myBus) {
        setBusId(myBus.id);
        // 2. Fetch students on this bus
        api.get(`/students/bus/${myBus.id}`).then(({ data }) => {
          setStudents(data);
        });
      }
    });
  }, [user.id]);

  useGeolocation({
    enabled: tracking,
    onUpdate: (pos) => {
      setLastPos(pos);
      const now = Date.now();
      if (now - throttleRef.current < 4000) return;
      throttleRef.current = now;
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

  const markBoarded = async (studentId, type) => {
    try {
      await api.post('/students/board', {
        student_id: studentId,
        bus_id: busId,
        type: type // 'board' or 'drop'
      });
      setBoarded(prev => ({ ...prev, [studentId]: type }));
    } catch (err) {
      alert('Failed to log boarding');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Driver — {user.name}</h1>
      <p className="text-sm text-gray-600 mb-4">Bus ID: {busId || 'Not assigned'}</p>

      {!tracking ? (
        <button onClick={startRoute} className="w-full bg-green-600 text-white p-3 rounded mb-4">
          ▶ Start Route
        </button>
      ) : (
        <button onClick={endRoute} className="w-full bg-red-600 text-white p-3 rounded mb-4">
          ⏹ End Route
        </button>
      )}

      {lastPos && (
        <div className="mb-6 text-sm text-gray-700 bg-gray-100 p-4 rounded">
          <p><strong>Lat:</strong> {lastPos.lat.toFixed(6)}</p>
          <p><strong>Lng:</strong> {lastPos.lng.toFixed(6)}</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Students on Bus</h2>
        {students.length === 0 ? (
          <p className="text-gray-500">No students assigned to this bus.</p>
        ) : (
          <ul className="space-y-3">
            {students.map((student) => (
              <li key={student.id} className="bg-white border rounded p-4 flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold">{student.name}</p>
                  <p className="text-xs text-gray-500">Grade: {student.grade}</p>
                </div>
                <div>
                  {boarded[student.id] === 'board' ? (
                    <span className="text-green-600 text-sm font-bold">✓ Boarded</span>
                  ) : boarded[student.id] === 'drop' ? (
                    <span className="text-blue-600 text-sm font-bold">✓ Dropped</span>
                  ) : (
                    <button 
                      onClick={() => markBoarded(student.id, 'board')}
                      className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
                    >
                      Mark Boarded
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={logout} className="mt-8 text-red-600 underline">
        Logout
      </button>
    </div>
  );
}