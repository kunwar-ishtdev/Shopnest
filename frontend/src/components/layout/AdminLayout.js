import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiBell, FiSettings
} from 'react-icons/fi';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: FiPackage, label: 'Products' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-dark-950 flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-dark-800">
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-white font-bold" style={{ fontFamily: 'Clash Display' }}>ShopNest <span className="text-brand-500 text-xs font-normal">Admin</span></span>
            </Link>
          ) : (
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xs">S</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive(to, exact)
                  ? 'bg-brand-600 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-4 border-t border-dark-800 space-y-1">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-all`}>
            <FiSettings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Back to Store</span>}
          </Link>
          <button
            onClick={() => { dispatch(logout()); navigate('/'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-dark-800 transition-all"
          >
            <FiLogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost p-2"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          <div className="flex items-center gap-4">
            <button className="relative btn-ghost p-2">
              <FiBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.firstName?.[0]}
              </div>
              <span className="text-sm font-medium text-dark-700">{user?.firstName} {user?.lastName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}