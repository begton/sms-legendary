import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, Users as UsersIcon, X } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ user_name: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/auth/users');
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => { setForm({ user_name: '', password: '' }); setEditId(null); setShowModal(true); };
  const openEdit = (u) => { setForm({ user_name: u.user_name, password: '' }); setEditId(u.user_id); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await API.put(`/auth/users/${editId}`, form);
        toast.success('User updated!');
      } else {
        await API.post('/auth/register', form);
        toast.success('User registered!');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/auth/users/${id}`);
      toast.success('User deleted!');
      fetchUsers();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-7 w-7 text-purple-600" /> Users
          </h1>
          <p className="text-gray-500 text-sm">Manage system user accounts</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-th">#</th>
              <th className="table-th">Username</th>
              <th className="table-th">Created At</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="table-td text-center py-8 text-gray-400">Loading...</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.user_id} className="hover:bg-purple-50 transition-colors">
                <td className="table-td text-gray-400">{i + 1}</td>
                <td className="table-td">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                      {u.user_name[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800">{u.user_name}</span>
                  </div>
                </td>
                <td className="table-td text-gray-500">{new Date(u.created_at).toLocaleString()}</td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(u)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(u.user_id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-lg text-gray-800">{editId ? 'Edit' : 'Add'} User</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input type="text" required className="input-field" placeholder="Enter username"
                  value={form.user_name} onChange={e => setForm({...form, user_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editId && <span className="text-gray-400 text-xs">(leave blank to keep)</span>}
                </label>
                <input type="password" required={!editId} className="input-field" placeholder="Enter password"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? 'Saving...' : editId ? 'Update' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
