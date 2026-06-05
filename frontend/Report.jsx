import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X, PackagePlus } from 'lucide-react';

const ITEMS = ['Steel Bars','Wheelbarrows','Ceramic Tiles','Cement','Painting Brush','Color Paint','Masonry Nails','Iron Sheets'];
const today = new Date().toISOString().split('T')[0];

const emptyForm = { itemName: '', description: '', quantityIn: '', supplierName: '', stockInDate: today };

export default function StockIn() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchRecords = async (q = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/stockin${q ? `?search=${q}` : ''}`);
      setRecords(res.data);
    } catch { toast.error('Failed to fetch records'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecords(search);
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (r) => {
    setForm({ itemName: r.itemName, description: r.description, quantityIn: r.quantityIn, supplierName: r.supplierName, stockInDate: r.stockInDate?.split('T')[0] || today });
    setEditId(r.stockIn_id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await API.put(`/stockin/${editId}`, form);
        toast.success('Record updated!');
      } else {
        await API.post('/stockin', form);
        toast.success('Stock in recorded!');
      }
      setShowModal(false);
      fetchRecords(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await API.delete(`/stockin/${id}`);
      toast.success('Deleted!');
      fetchRecords(search);
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PackagePlus className="h-7 w-7 text-blue-600" /> Stock In
          </h1>
          <p className="text-gray-500 text-sm">Manage received stock items</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus className="h-4 w-4" /> Add Stock In
        </button>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search by item or supplier..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
          {search && <button type="button" onClick={() => { setSearch(''); fetchRecords(); }} className="btn-secondary px-3"><X className="h-4 w-4" /></button>}
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-th">#</th>
              <th className="table-th">Item Name</th>
              <th className="table-th">Description</th>
              <th className="table-th">Qty In</th>
              <th className="table-th">Total Qty In</th>
              <th className="table-th">Supplier</th>
              <th className="table-th">Date</th>
              <th className="table-th">Recorded By</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="table-td text-center py-8 text-gray-400">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={9} className="table-td text-center py-8 text-gray-400">No records found.</td></tr>
            ) : records.map((r, i) => (
              <tr key={r.stockIn_id} className="hover:bg-blue-50 transition-colors">
                <td className="table-td text-gray-400">{i + 1}</td>
                <td className="table-td font-semibold text-gray-800">{r.itemName}</td>
                <td className="table-td text-gray-500 max-w-xs truncate">{r.description}</td>
                <td className="table-td text-blue-600 font-medium">{r.quantityIn}</td>
                <td className="table-td font-semibold text-blue-800">{r.totalQuantityIn}</td>
                <td className="table-td">{r.supplierName}</td>
                <td className="table-td">{r.stockInDate?.split('T')[0]}</td>
                <td className="table-td">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{r.user_name}</span>
                </td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(r.stockIn_id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-lg text-gray-800">{editId ? 'Edit' : 'Add'} Stock In</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <select required className="input-field" value={form.itemName} onChange={e => setForm({...form, itemName: e.target.value})}>
                  <option value="">Select item...</option>
                  {ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={2} placeholder="Item description..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity In *</label>
                  <input type="number" required min="1" className="input-field"
                    value={form.quantityIn} onChange={e => setForm({...form, quantityIn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" required className="input-field"
                    value={form.stockInDate} onChange={e => setForm({...form, stockInDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
                <input type="text" required className="input-field" placeholder="Supplier name..."
                  value={form.supplierName} onChange={e => setForm({...form, supplierName: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? 'Saving...' : editId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
