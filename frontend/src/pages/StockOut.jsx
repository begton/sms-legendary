import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search, X, PackageMinus } from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const emptyForm = { stockIn_id: '', itemName: '', quantityOut: '', stockOutDate: today };

export default function StockOut() {
  const [records, setRecords] = useState([]);
  const [stockInList, setStockInList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);

  const fetchRecords = async (q = '') => {
    setLoading(true);
    try {
      const res = await API.get(`/stockout${q ? `?search=${q}` : ''}`);
      setRecords(res.data);
    } catch { toast.error('Failed to fetch records'); }
    finally { setLoading(false); }
  };

  const fetchStockIn = async () => {
    const res = await API.get('/stockin');
    setStockInList(res.data);
    // Get unique items
    const items = [...new Set(res.data.map(r => r.itemName))];
    setAvailableItems(items);
  };

  useEffect(() => { fetchRecords(); fetchStockIn(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchRecords(search); };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
  const openEdit = (r) => {
    setForm({ stockIn_id: r.stockIn_id, itemName: r.itemName, quantityOut: r.quantityOut, stockOutDate: r.stockOutDate?.split('T')[0] || today });
    setEditId(r.stockOut_id); setShowModal(true);
  };

  const handleItemChange = (itemName) => {
    // Find latest stockIn_id for this item
    const match = stockInList.find(r => r.itemName === itemName);
    setForm(f => ({ ...f, itemName, stockIn_id: match ? match.stockIn_id : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        await API.put(`/stockout/${editId}`, form);
        toast.success('Record updated!');
      } else {
        await API.post('/stockout', form);
        toast.success('Stock out recorded!');
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
      await API.delete(`/stockout/${id}`);
      toast.success('Deleted!');
      fetchRecords(search);
    } catch { toast.error('Delete failed'); }
  };

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <PackageMinus className="h-7 w-7 text-orange-600" /> Stock Out
          </h1>
          <p className="text-gray-500 text-sm">Manage issued stock items</p>
        </div>
        <button onClick={openAdd} className="btn-success">
          <Plus className="h-4 w-4" /> Issue Stock
        </button>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search by item name..."
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
              <th className="table-th">Qty Out</th>
              <th className="table-th">Total Qty Out</th>
              <th className="table-th">Date</th>
              <th className="table-th">Recorded By</th>
              <th className="table-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="table-td text-center py-8 text-gray-400">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} className="table-td text-center py-8 text-gray-400">No records found.</td></tr>
            ) : records.map((r, i) => (
              <tr key={r.stockOut_id} className="hover:bg-orange-50 transition-colors">
                <td className="table-td text-gray-400">{i + 1}</td>
                <td className="table-td font-semibold text-gray-800">{r.itemName}</td>
                <td className="table-td text-orange-600 font-medium">{r.quantityOut}</td>
                <td className="table-td font-semibold text-orange-800">{r.totalQuantityOut}</td>
                <td className="table-td">{r.stockOutDate?.split('T')[0]}</td>
                <td className="table-td">
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">{r.user_name}</span>
                </td>
                <td className="table-td">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className="p-1.5 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(r.stockOut_id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
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
              <h2 className="font-bold text-lg text-gray-800">{editId ? 'Edit' : 'Issue'} Stock Out</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <select required className="input-field" value={form.itemName}
                  onChange={e => handleItemChange(e.target.value)}>
                  <option value="">Select item...</option>
                  {availableItems.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Out *</label>
                  <input type="number" required min="1" className="input-field"
                    value={form.quantityOut} onChange={e => setForm({...form, quantityOut: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" required className="input-field"
                    value={form.stockOutDate} onChange={e => setForm({...form, stockOutDate: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
                  {submitting ? 'Saving...' : editId ? 'Update' : 'Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
