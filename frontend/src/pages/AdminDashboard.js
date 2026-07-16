import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllOrders } from '../store/slices/orderSlice';
import { fetchProducts } from '../store/slices/productSlice';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { allOrders } = useSelector((s) => s.orders);
  const { items: products } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchAllOrders({ limit: 10 }));
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = allOrders.filter((o) => o.status === 'pending').length;

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-green-50 text-green-600', trend: '+12%' },
    { label: 'Total Orders', value: allOrders.length, icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600', trend: '+8%' },
    { label: 'Products', value: products.length, icon: FiPackage, color: 'bg-purple-50 text-purple-600', trend: '+3%' },
    { label: 'Pending Orders', value: pendingOrders, icon: FiTrendingUp, color: 'bg-amber-50 text-amber-600', trend: pendingOrders > 0 ? 'Action needed' : 'All clear' },
  ];

  const STATUS_COLORS = {
    pending: 'badge-warning',
    confirmed: 'badge-info',
    processing: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark-900" style={{ fontFamily: 'Clash Display' }}>Dashboard</h1>
        <p className="text-dark-400 mt-1">Welcome back! Here's what's happening with ShopNest.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">{trend}</span>
            </div>
            <p className="text-2xl font-bold text-dark-900 mb-1">{value}</p>
            <p className="text-sm text-dark-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark-900">Recent Orders</h2>
            <Link to="/admin/orders" className="btn-ghost text-sm text-brand-600">
              View all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {allOrders.slice(0, 6).map((order) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <p className="text-sm font-medium text-dark-800 font-mono">#{order._id?.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-dark-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className={`${STATUS_COLORS[order.status] || 'badge-info'} text-xs`}>{order.status}</span>
                <span className="text-sm font-semibold text-dark-800">₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {allOrders.length === 0 && (
              <p className="text-sm text-dark-400 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-dark-900">Products</h2>
            <Link to="/admin/products" className="btn-ghost text-sm text-brand-600">
              Manage <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {products.slice(0, 6).map((product) => (
              <div key={product._id} className="flex items-center gap-3">
                <img
                  src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/40/40`}
                  alt={product.name}
                  className="w-10 h-10 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-800 truncate">{product.name}</p>
                  <p className="text-xs text-dark-400">Stock: {product.stock}</p>
                </div>
                <span className="text-sm font-semibold text-dark-800">₹{product.price?.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-dark-400 text-center py-4">No products yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}