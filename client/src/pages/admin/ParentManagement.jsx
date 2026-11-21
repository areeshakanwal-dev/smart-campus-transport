import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
};

export default function ParentManagement() {
  const [parents, setParents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const loadParents = async () => {
    try {
      const { data } = await api.get('/admin/parents');
      setParents(data);
    } catch (err) {
      console.error('Failed to load parents', err);
    }
  };

  useEffect(() => {
    loadParents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/parents', form);
      setShowModal(false);
      setForm(emptyForm);
      loadParents(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register parent');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this parent?')) return;
    try {
      await api.delete(`/admin/parents/${id}`);
      loadParents();
    } catch (err) {
      alert('Failed to delete parent');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Parent Management</h1>
        <button
          onClick={() => { setForm(emptyForm); setError(''); setShowModal(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          ➕ Register Parent
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto border border-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Parent Name</th>
              <th className="p-4 font-semibold text-gray-600">Email</th>
              <th className="p-4 font-semibold text-gray-600">Phone</th>
              <th className="p-4 font-semibold text-gray-600">Children</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {parents.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No parents registered yet.
                </td>
              </tr>
            ) : (
              parents.map((parent) => (
                <tr key={parent.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{parent.name}</td>
                  <td className="p-4 text-gray-600">{parent.email}</td>
                  <td className="p-4 text-gray-600">{parent.phone || '–'}</td>
                  <td className="p-4 text-gray-600">
                    {/* Yahan hum wo children names show kar rahe hain jo backend query se aaye hain */}
                    {parent.children_names ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {parent.children_names}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">No children linked</span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Parent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800">Register New Parent</h2>
            
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required placeholder="e.g. Mr. Khan" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" required placeholder="parent@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input placeholder="03001234567" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              <p className="text-xs text-gray-500 mt-1">Provide this password to the parent so they can log in.</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowModal(false)} 
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Save Parent
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}