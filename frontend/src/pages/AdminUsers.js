// AdminUsers.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FiSearch, FiUser, FiShield } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/users/admin/users')
      .then((res) => setUsers(res.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) => u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
           u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900" style={{ fontFamily: 'Clash Display' }}>Users</h1>
        <p className="text-dark-400 mt-1">{users.length} registered users</p>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative max-w-sm">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 text-sm" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['User', 'Email', 'Phone', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-dark-400">No users found</td></tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {user.firstName?.[0]}
                        </div>
                        <span className="font-medium text-dark-800">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-dark-600">{user.email}</td>
                    <td className="px-5 py-4 text-dark-500">{user.phone || '—'}</td>
                    <td className="px-5 py-4">
                      <span className={user.role === 'admin' ? 'badge bg-purple-50 text-purple-700' : 'badge bg-gray-100 text-dark-600'}>
                        {user.role === 'admin' ? <><FiShield size={11} className="inline mr-1" />Admin</> : <><FiUser size={11} className="inline mr-1" />User</>}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-dark-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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