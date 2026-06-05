import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import API from '../utils/api';
import { PackagePlus, PackageMinus, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [users, setUsers] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/stockout/report/full'),
      API.get('/auth/users')
    ]).then(([reportRes, usersRes]) => {
      const report = reportRes.data;
      setSummary(report);
      setTotalIn(report.reduce((a, r) => a + r.totalReceived, 0));
      setTotalOut(report.reduce((a, r) => a + r.totalIssued, 0));
      setUsers(usersRes.data.length);
      setLowStock(report.filter(r => r.remainingQty < 20));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Received', value: totalIn, icon: PackagePlus, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Total Issued', value: totalOut, icon: PackageMinus, color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
    { label: 'Items In Stock', value: summary.length, icon: Package, color: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600' },
    { label: 'System Users', value: users, icon: Users, color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
  ];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">DAB Enterprise LTD — Store Management Overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color, light, text }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`${light} p-3 rounded-xl`}>
              <Icon className={`h-7 w-7 ${text}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Overview Table */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Stock Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-th rounded-tl-lg">Item</th>
                  <th className="table-th">Received</th>
                  <th className="table-th">Issued</th>
                  <th className="table-th rounded-tr-lg">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="table-td text-center text-gray-400">Loading...</td></tr>
                ) : summary.length === 0 ? (
                  <tr><td colSpan={4} className="table-td text-center text-gray-400">No data</td></tr>
                ) : summary.map((item) => (
                  <tr key={item.itemName} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium text-gray-800">{item.itemName}</td>
                    <td className="table-td text-blue-600">{item.totalReceived}</td>
                    <td className="table-td text-orange-600">{item.totalIssued}</td>
                    <td className="table-td">
                      <span className={`font-semibold ${item.remainingQty < 20 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.remainingQty}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="font-semibold text-gray-800">Low Stock Alerts</h2>
            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">&lt; 20 units</span>
          </div>
          {loading ? <p className="text-gray-400 text-sm">Loading...</p>
            : lowStock.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-600 font-medium">All items have sufficient stock</p>
              </div>
            ) : lowStock.map(item => (
              <div key={item.itemName} className="flex items-center justify-between p-3 bg-red-50 rounded-lg mb-2">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.itemName}</p>
                  <p className="text-xs text-gray-500">Only {item.remainingQty} left</p>
                </div>
                <span className="text-red-600 font-bold">{item.remainingQty}</span>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
