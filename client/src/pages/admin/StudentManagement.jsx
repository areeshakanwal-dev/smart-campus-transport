import { useEffect, useState } from 'react';
import api from '../../api/axios';

const emptyForm = { name: '', grade: '', parent_id: '', bus_id: '', stop_id: '' };

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    const [s, p, b, st] = await Promise.all([
      api.get('/students'),
      api.get('/admin/parents'),
      api.get('/buses'),
      api.get('/buses/stops/list').catch(() => ({ data: [] })), // assuming you have this route
    ]);
    setStudents(s.data);
    setParents(p.data);
    setBuses(b.data);
    setStops(st.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/students', form);
    setShowModal(false);
    setForm(emptyForm);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    await api.delete(`/students/${id}`);
    loadData();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
          ➕ Register Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Grade</th>
              <th className="p-3">Parent</th>
              <th className="p-3">Bus</th>
              <th className="p-3">Stop</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3 font-medium">{s.name}</td>
                <td className="p-3">{s.grade}</td>
                <td className="p-3">{s.parent_name || '–'}</td>
                <td className="p-3">{s.bus_number || '–'}</td>
                <td className="p-3">{s.stop_name || '–'}</td>
                <td className="p-3">
                  <button onClick={() => handleDelete(s.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
            <h2 className="text-lg font-bold">Register Student</h2>
            
            <input required placeholder="Student Name" value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded" />
            
            <input required placeholder="Grade (e.g. 10th)" value={form.grade} 
              onChange={(e) => setForm({ ...form, grade: e.target.value })} className="w-full border p-2 rounded" />
            
            <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="w-full border p-2 rounded">
              <option value="">-- Select Parent --</option>
              {parents.map(p => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
            </select>

            <select value={form.bus_id} onChange={(e) => setForm({ ...form, bus_id: e.target.value })} className="w-full border p-2 rounded">
              <option value="">-- Assign Bus --</option>
              {buses.map(b => <option key={b.id} value={b.id}>{b.bus_number}</option>)}
            </select>

            <select value={form.stop_id} onChange={(e) => setForm({ ...form, stop_id: e.target.value })} className="w-full border p-2 rounded">
              <option value="">-- Assign Stop --</option>
              {stops.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
            </select>

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