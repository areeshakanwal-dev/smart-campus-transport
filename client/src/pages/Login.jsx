import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'driver') navigate('/driver');
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-navy rounded-full mb-4">
            <span className="text-3xl">🚌</span>
          </div>
          <h1 className="text-3xl font-extrabold text-brand-navy">Campus Express</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        
        {/* ... error handling ... */}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* inputs ... */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow hover:bg-yellow-500 text-brand-navy font-bold py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        {/* ... register link ... */}
      </div>
    </div>
  );
}