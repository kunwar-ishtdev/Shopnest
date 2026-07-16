// AdminOrders.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../store/slices/orderSlice';
import { FiSearch } from 'react-icons/fi';

const STATUS_COLORS = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', delivered: 'badge-success', cancelled: 'badge-error',
};

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { allOrders, loading } = useSelector((s) => s.orders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { dispatch(fetchAllOrders({ limit: 100 })); }, [dispatch]);

  const filtered = allOrders.filter((o) => {
    const matchesSearch = !search || o._id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900" style={{ fontFamily: 'Clash Display' }}>Orders</h1>
        <p className="text-dark-400 mt-1">{allOrders.length} total orders</p>
      </div>

      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID..." className="input-field pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field text-sm w-auto">
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Order ID', 'Date', 'Items', 'Total', 'Status', 'Update Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-dark-400">No orders found</td></tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-xs text-dark-700">#{order._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-dark-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-4 text-dark-600">{order.items?.length} item(s)</td>
                    <td className="px-5 py-4 font-semibold">₹{order.total?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4"><span className={`${STATUS_COLORS[order.status] || 'badge-info'} capitalize`}>{order.status}</span></td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => dispatch(updateOrderStatus({ id: order._id, status: e.target.value }))}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-brand-500"
                      >
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}