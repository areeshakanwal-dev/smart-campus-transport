import { useAuth } from '../context/AuthContext';
export default function DriverDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Driver Dashboard — {user?.name}</h1>
      <button onClick={logout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
    </div>
  );
}