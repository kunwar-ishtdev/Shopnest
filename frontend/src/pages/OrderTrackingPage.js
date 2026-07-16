import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../store/slices/orderSlice';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: FiClock, desc: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheckCircle, desc: 'Seller confirmed your order' },
  { key: 'processing', label: 'Processing', icon: FiPackage, desc: 'Order is being prepared' },
  { key: 'shipped', label: 'Shipped', icon: FiTruck, desc: 'Order is on its way' },
  { key: 'delivered', label: 'Delivered', icon: FiCheckCircle, desc: 'Order delivered successfully' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending: 'badge-warning',
  confirmed: 'badge-info',
  processing: 'badge-info',
  shipped: 'badge-info',
  delivered: 'badge-success',
  cancelled: 'badge-error',
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, loading } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  if (loading) return (
    <div className="container-app py-10">
      <div className="max-w-2xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    </div>
  );

  if (!order) return (
    <div className="container-app py-20 text-center">
      <p className="text-xl font-semibold mb-4">Order not found</p>
      <Link to="/dashboard?tab=orders" className="btn-primary">My Orders</Link>
    </div>
  );

  const currentStepIndex = order.status === 'cancelled'
    ? -1
    : STATUS_ORDER.indexOf(order.status);

  return (
    <div className="container-app py-10 max-w-3xl">
      <Link to="/dashboard?tab=orders" className="btn-ghost mb-6 inline-flex">
        <FiArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-dark-400 mb-1">Order ID</p>
            <p className="text-lg font-mono font-bold text-dark-900">#{order._id?.slice(-8).toUpperCase()}</p>
            <p className="text-sm text-dark-400 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <span className={`${STATUS_COLORS[order.status] || 'badge-info'} text-sm px-3 py-1.5`}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            </span>
            <p className="text-2xl font-bold text-dark-900 mt-2">₹{order.total?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Tracking Steps */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-dark-900 mb-6">Order Status</h2>

        {order.status === 'cancelled' ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-600">
            <FiXCircle size={24} />
            <div>
              <p className="font-semibold">Order Cancelled</p>
              <p className="text-sm text-red-400">This order has been cancelled</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      isCompleted
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-dark-400'
                    } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}>
                      <Icon size={18} />
                    </div>
                    {idx < TRACKING_STEPS.length - 1 && (
                      <div className={`w-0.5 h-10 ${isCompleted ? 'bg-brand-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className={`font-semibold text-sm ${isCompleted ? 'text-dark-900' : 'text-dark-400'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${isCompleted ? 'text-dark-500' : 'text-dark-300'}`}>
                      {step.desc}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-1 text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
                        Current Status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold text-dark-900 mb-5">Items Ordered</h2>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <img
                src={item.product?.images?.[0] || `https://picsum.photos/seed/${item.product?._id || i}/60/60`}
                alt={item.product?.name}
                className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-800 line-clamp-1">{item.product?.name || 'Product'}</p>
                <p className="text-xs text-dark-400">Qty: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}</p>
              </div>
              <p className="font-semibold text-sm">₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold text-dark-900 mb-3 text-sm">Shipping Address</h3>
          <div className="text-sm text-dark-600 space-y-1">
            <p className="font-medium text-dark-800">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p>📞 {order.shippingAddress?.phone}</p>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-bold text-dark-900 mb-3 text-sm">Payment Summary</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-dark-600"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-dark-600"><span>Delivery</span><span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span></div>
            <div className="flex justify-between text-dark-600"><span>Tax</span><span>₹{order.tax?.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-bold text-dark-900 border-t pt-1.5"><span>Total</span><span>₹{order.total?.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}