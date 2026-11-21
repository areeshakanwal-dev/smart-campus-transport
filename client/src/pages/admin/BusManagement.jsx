import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = {
  bus_number: '', registration_number: '', capacity: 40,
  driver_id: '', route_id: '', is_active: true,
};

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    const [b, d, r] = await Promise.all([
      api.get('/buses'),
      api.get('/admin/drivers').catch(() => ({ data: [] })),
      api.get('/routes').catch(() => ({ data: [] })),
    ]);
    setBuses(b.data);
    setDrivers(d.data);
    setRoutes(r.data);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (bus) => { setForm({ ...emptyForm, ...bus }); setEditingId(bus.id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/buses/${editingId}`, form);
    else await api.post('/buses', form);
    setShowModal(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bus?')) return;
    await api.delete(`/buses/${id}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bus Management</h1>
        <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded">
          ➕ Add Bus
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Bus #</th>
              <th className="p-3">Registration</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Driver</th>
              <th className="p-3">Route</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-3 font-medium">{b.bus_number}</td>
                <td className="p-3">{b.registration_number || '–'}</td>
                <td className="p-3">{b.capacity}</td>
                <td className="p-3">{b.driver_name || 'Unassigned'}</td>
                <td className="p-3">{b.route_name || '–'}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => openEdit(b)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-lg font-bold">{editingId ? 'Edit Bus' : 'Add Bus'}</h2>
            <input required placeholder="Bus Number (e.g. BUS-001)" value={form.bus_number}
              onChange={(e) => setForm({ ...form, bus_number: e.target.value })}
              className="w-full border p-2 rounded" />
            <input placeholder="Registration Number" value={form.registration_number || ''}
              onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
              className="w-full border p-2 rounded" />
            <input type="number" placeholder="Capacity" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full border p-2 rounded" />
            <select value={form.driver_id || ''} onChange={(e) => setForm({ ...form, driver_id: e.target.value || null })}
              className="w-full border p-2 rounded">
              <option value="">-- Assign Driver --</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={form.route_id || ''} onChange={(e) => setForm({ ...form, route_id: e.target.value || null })}
              className="w-full border p-2 rounded">
              <option value="">-- Assign Route --</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              Active
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}