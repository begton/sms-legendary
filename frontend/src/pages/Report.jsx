import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../utils/api';
import { BarChart3, Calendar, Download, RefreshCw } from 'lucide-react';

export default function Report() {
  const [report, setReport] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState('full'); // 'daily' | 'full'
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (mode === 'daily') {
        const res = await API.get(`/stockout/report/daily?date=${date}`);
        setReport(res.data.report);
      } else {
        const res = await API.get('/stockout/report/full');
        setReport(res.data);
      }
    } catch { setReport([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [mode, date]);

  const handlePrint = () => { window.print(); };

  const totalReceived = report.reduce((a, r) => a + Number(r.totalReceived), 0);
  const totalIssued = report.reduce((a, r) => a + Number(mode === 'daily' ? r.totalIssuedToday : r.totalIssued), 0);
  const totalRemaining = report.reduce((a, r) => a + Number(r.remainingQty), 0);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-green-600" /> Stock Status Report
        </h1>
        <p className="text-gray-500 text-sm">DAB Enterprise LTD — Kigali, Rwanda</p>
      </div>

      {/* Controls */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button onClick={() => setMode('full')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'full' ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                All Time
              </button>
              <button onClick={() => setMode('daily')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${mode === 'daily' ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                Daily
              </button>
            </div>
          </div>
          {mode === 'daily' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="date" className="input-field pl-9 w-48" value={date}
                  onChange={e => setDate(e.target.value)} />
              </div>
            </div>
          )}
          <div className="flex gap-2 ml-auto">
            <button onClick={fetchReport} className="btn-secondary"><RefreshCw className="h-4 w-4" /> Refresh</button>
            <button onClick={handlePrint} className="btn-primary"><Download className="h-4 w-4" /> Print</button>
          </div>
        </div>
      </div>

      {/* Report Header (printable) */}
      <div className="card">
        <div className="text-center mb-6 print:block">
          <h2 className="text-xl font-bold text-gray-800">DAB Enterprise LTD</h2>
          <p className="text-gray-500 text-sm">Kigali, Rwanda — Building Materials & Construction Tools</p>
          <p className="text-blue-700 font-semibold mt-1">
            {mode === 'daily' ? `Daily Stock Report — ${date}` : 'Comprehensive Stock Status Report'}
          </p>
          <p className="text-gray-400 text-xs">Generated: {new Date().toLocaleString()}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-500 font-medium uppercase">Total Received</p>
            <p className="text-2xl font-bold text-blue-700">{totalReceived}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-xs text-orange-500 font-medium uppercase">Total Issued</p>
            <p className="text-2xl font-bold text-orange-700">{totalIssued}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-xs text-green-500 font-medium uppercase">Remaining</p>
            <p className="text-2xl font-bold text-green-700">{totalRemaining}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-th">#</th>
                <th className="table-th">Item Name</th>
                <th className="table-th">Total Qty Received</th>
                <th className="table-th">{mode === 'daily' ? 'Qty Issued Today' : 'Total Qty Issued'}</th>
                <th className="table-th">Remaining Qty in Stock</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="table-td text-center py-8 text-gray-400">Loading report...</td></tr>
              ) : report.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center py-8 text-gray-400">No data for this period.</td></tr>
              ) : report.map((item, i) => {
                const issued = mode === 'daily' ? item.totalIssuedToday : item.totalIssued;
                const status = item.remainingQty <= 0 ? 'Out of Stock' : item.remainingQty < 20 ? 'Low Stock' : 'In Stock';
                const statusColor = item.remainingQty <= 0 ? 'bg-red-100 text-red-700' : item.remainingQty < 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
                return (
                  <tr key={item.itemName} className="hover:bg-gray-50">
                    <td className="table-td text-gray-400">{i + 1}</td>
                    <td className="table-td font-semibold text-gray-800">{item.itemName}</td>
                    <td className="table-td text-blue-600 font-medium">{item.totalReceived}</td>
                    <td className="table-td text-orange-600 font-medium">{issued}</td>
                    <td className="table-td">
                      <span className={`font-bold ${item.remainingQty < 20 ? 'text-red-600' : 'text-green-700'}`}>
                        {item.remainingQty}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="table-td" colSpan={2}>TOTALS</td>
                <td className="table-td text-blue-700">{totalReceived}</td>
                <td className="table-td text-orange-700">{totalIssued}</td>
                <td className="table-td text-green-700">{totalRemaining}</td>
                <td className="table-td"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Layout>
  );
}
