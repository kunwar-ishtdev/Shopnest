import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { updateProfile } from '../store/slices/authSlice';
import { FiPackage, FiHeart, FiUser, FiMapPin, FiEdit2, FiExternalLink } from 'react-icons/fi';

const tabs = [
  { id: 'profile', label: 'Profile', icon: FiUser },
  { id: 'orders', label: 'My Orders', icon: FiPackage },
  { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
];

const STATUS_COLORS = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-error',
};

export default function UserDashboard() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((s) => s.auth);
  const { myOrders, loading } = useSelector((s) => s.orders);
  const wishlist = useSelector((s) => s.wishlist.items);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleProfileSave = () => {
    dispatch(updateProfile(profileForm));
    setEditMode(false);
  };

  return (
    <div className="container-app py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
          {user?.firstName?.[0]}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-dark-900" style={{ fontFamily: 'Clash Display' }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-dark-400 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <div className="card p-3 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === id
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-dark-600 hover:bg-gray-50 hover:text-dark-900'
                }`}
              >
                <Icon size={17} />
                {label}
                {id === 'orders' && myOrders.length > 0 && (
                  <span className="ml-auto badge bg-gray-100 text-dark-600 text-xs">{myOrders.length}</span>
                )}
                {id === 'wishlist' && wishlist.length > 0 && (
                  <span className="ml-auto badge bg-gray-100 text-dark-600 text-xs">{wishlist.length}</span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-dark-900">Personal Information</h2>
                <button onClick={() => setEditMode(!editMode)} className="btn-ghost text-sm">
                  <FiEdit2 size={15} /> {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {editMode ? (
                <div className="space-y-4 max-w-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <button onClick={handleProfileSave} className="btn-primary">Save Changes</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: `${user?.firstName} ${user?.lastName}` },
                    { label: 'Email', value: user?.email },
                    { label: 'Phone', value: user?.phone || 'Not provided' },
                    { label: 'Role', value: user?.role === 'admin' ? '🛡️ Administrator' : '👤 Customer' },
                    { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-medium text-dark-500 w-36 flex-shrink-0">{label}</span>
                      <span className="text-sm text-dark-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-dark-900 mb-6">My Orders</h2>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2">
                      <div className="skeleton h-4 w-1/3" />
                      <div className="skeleton h-3 w-2/3" />
                      <div className="skeleton h-3 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : myOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="font-semibold text-dark-700 mb-1">No orders yet</p>
                  <p className="text-sm text-dark-400 mb-4">Start shopping to see your orders here</p>
                  <Link to="/products" className="btn-primary">Shop Now</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order._id} className="border border-gray-200 rounded-xl p-4 hover:border-brand-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-mono font-medium text-dark-700">#{order._id?.slice(-8).toUpperCase()}</p>
                          <p className="text-xs text-dark-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={STATUS_COLORS[order.status] || 'badge-info'}>
                            {order.status}
                          </span>
                          <Link to={`/orders/${order._id}/track`} className="btn-ghost text-xs p-1.5">
                            <FiExternalLink size={14} />
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product}/40/40`}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-gray-50"
                          />
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-dark-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-dark-900">₹{order.total?.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-dark-900 mb-6">My Wishlist ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">❤️</div>
                  <p className="font-semibold text-dark-700 mb-1">Your wishlist is empty</p>
                  <p className="text-sm text-dark-400 mb-4">Save items you love by clicking the heart icon</p>
                  <Link to="/products" className="btn-primary">Explore Products</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {wishlist.map((item) => (
                    <Link key={item.id || item._id} to={`/products/${item.id || item._id}`} className="group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
                        <img
                          src={item.images?.[0] || `https://picsum.photos/seed/${item.id || item._id}/200/200`}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-sm font-medium text-dark-800 line-clamp-1">{item.name}</p>
                      <p className="text-sm font-bold text-brand-600">₹{item.price?.toLocaleString('en-IN')}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-dark-900 mb-6">Saved Addresses</h2>
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📍</div>
                <p className="font-semibold text-dark-700 mb-1">No saved addresses</p>
                <p className="text-sm text-dark-400">Addresses you save during checkout will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}