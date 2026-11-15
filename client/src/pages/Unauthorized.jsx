import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600 mb-4">403 — Forbidden</h1>
      <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
      <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded">
        Back to Login
      </Link>
    </div>
  );
}