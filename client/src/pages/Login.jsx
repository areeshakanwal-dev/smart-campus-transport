import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Automatically redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver');
      else navigate('/parent');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      if (loggedInUser.role === 'admin') navigate('/admin');
      else if (loggedInUser.role === 'driver') navigate('/driver');
      else navigate('/parent');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0F172A] rounded-full mb-4">
            <span className="text-3xl">🚌</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Campus Express</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FBBF24] hover:bg-yellow-500 text-[#0F172A] font-bold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-sm text-center text-gray-600 mt-6">
          Don't have an account? <Link to="/register" className="text-[#1E3A8A] hover:underline font-medium">Register here</Link>
        </p>
      </div>
    </div>
  );
}