import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../context/AuthContext";
import { connectSocket } from "../api/socket";
import api from "../api/axios";

// Fix Leaflet marker icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [busId, setBusId] = useState(null);
  const [busPos, setBusPos] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const socketRef = useRef(null);
  const [stopId, setStopId] = useState(null);
  const [eta, setEta] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [boardingStatus, setBoardingStatus] = useState(null);

  // 1. Fetch the student's bus ID automatically
  // 1. Fetch the student's bus ID and stop ID automatically
   useEffect(() => {
    api.get('/students/me')
      .then(({ data }) => {
        if (data?.bus_id) setBusId(data.bus_id);
        if (data?.stop_id) setStopId(data.stop_id);
        if (data?.id) setStudentId(data.id); // <-- Add this
      })
      .catch((err) => console.log(err));
  }, []);

    // Poll for boarding status
  useEffect(() => {
    if (!studentId) return;
    const interval = setInterval(() => {
      api.get(`/students/${studentId}/status`)
        .then(({ data }) => setBoardingStatus(data))
        .catch(() => {});
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, [studentId]);

  // 2. Connect to socket and listen for live location
  useEffect(() => {
    if (!busId) return;

    // Instantly fetch the LAST known location
    api
      .get(`/buses/${busId}/last-location`)
      .then(({ data }) => {
        setBusPos({ lat: data.lat, lng: data.lng });
        setLastUpdate(new Date(data.recorded_at));
      })
      .catch(() => console.log("No previous location yet"));

    const socket = connectSocket();
    socketRef.current = socket;
    socket.emit("parent:subscribe", { busId });

    socket.on("bus:location", (data) => {
      if (data.busId === busId) {
        setBusPos({ lat: data.lat, lng: data.lng });
        setLastUpdate(new Date());

        // Fetch ETA every time a new location arrives
        if (stopId) {
          api
            .get(`/buses/${busId}/eta/${stopId}`)
            .then(({ data }) => setEta(data.eta_minutes))
            .catch(() => {});
        }
      }
    });

    socket.on("alert:arrival", (data) => {
      setAlertMessage(
        `🚌 Bus arriving at ${data.stopName} in ~${Math.round(data.distance)}m`,
      );
      setTimeout(() => setAlertMessage(null), 8000);
    });

    return () => {
      socket.emit("parent:unsubscribe", { busId });
      socket.off("bus:location");
      socket.off("alert:arrival");
    };
  }, [busId]);

  const isStale = lastUpdate && Date.now() - lastUpdate.getTime() > 15000;

  return (
    <div className="h-screen flex flex-col relative">
      <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Parent — {user.name}</h1>
        <button onClick={logout} className="underline hover:text-gray-200">
          Logout
        </button>
      </header>

      {alertMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 text-lg font-bold animate-bounce">
          {alertMessage}
        </div>
      )}

            {boardingStatus && boardingStatus.type === 'board' && (
        <div className="bg-green-100 text-green-800 p-2 text-center text-sm font-bold border-b border-green-300 z-10">
          ✅ Child boarded the bus at {new Date(boardingStatus.timestamp).toLocaleTimeString()}
        </div>
      )}

      <div className="p-2 text-sm bg-gray-100 text-gray-700 flex justify-between">
        {busPos ? (
          <>
            <span>Tracking Bus: {busId.substring(0, 8)}...</span>
            <span className="font-bold text-blue-700">
              {eta !== null
                ? `🚌 Arrives in ~${eta} min`
                : "Calculating ETA..."}
            </span>
            <span>
              Last update: {lastUpdate?.toLocaleTimeString()}
              {isStale && (
                <span className="text-red-600 ml-2 font-bold">
                  ⚠ Data is stale
                </span>
              )}
            </span>
          </>
        ) : (
          <span>Waiting for bus data...</span>
        )}
      </div>

      <MapContainer
        center={busPos || [33.6844, 73.0479]}
        zoom={15}
        style={{ flex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {busPos && (
          <Marker
            position={[busPos.lat, busPos.lng]}
            icon={L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
              iconRetinaUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
              shadowUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>Your bus is here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
