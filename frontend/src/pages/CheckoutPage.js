import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import { FiCreditCard, FiMapPin, FiCheck } from 'react-icons/fi';

const steps = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const { loading } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState({
    fullName: `${user?.firstName} ${user?.lastName}`.trim(),
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [payment, setPayment] = useState({ method: 'card', cardNumber: '', expiry: '', cvv: '' });

  const deliveryFee = total >= 499 ? 0 : 49;
  const tax = Math.round(total * 0.18);
  const grandTotal = total + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    const orderData = {
      items: items.map((i) => ({
        product: i.id || i._id,
        name: i.name,
        image: i.images?.[0] || '',
        quantity: i.quantity,
        price: Number(i.price),
      })),
      shippingAddress: shipping,
      paymentMethod: payment.method,
      subtotal: total,
      deliveryFee,
      tax,
      total: grandTotal,
    };
    const result = await dispatch(createOrder(orderData));
    if (result.meta.requestStatus === 'fulfilled') {
      dispatch(clearCart());
      navigate(`/orders/${result.payload._id}/track`);
    }
  };

  return (
    <div className="container-app py-10 max-w-5xl">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-brand-600' : 'text-dark-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                i < step ? 'bg-brand-600 border-brand-600 text-white' :
                i === step ? 'border-brand-600 text-brand-600 bg-brand-50' :
                'border-gray-300 text-gray-400'
              }`}>
                {i < step ? <FiCheck size={14} /> : i + 1}
              </div>
              <span className="font-medium text-sm hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-brand-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiMapPin size={20} className="text-brand-600" />
                <h2 className="font-bold text-dark-900">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', field: 'fullName', placeholder: 'Your full name', cols: 1 },
                  { label: 'Phone', field: 'phone', placeholder: '+91 98765 43210', cols: 1 },
                  { label: 'Address Line 1', field: 'addressLine1', placeholder: 'Street address', cols: 2 },
                  { label: 'Address Line 2', field: 'addressLine2', placeholder: 'Apartment, suite, etc. (optional)', cols: 2 },
                  { label: 'City', field: 'city', placeholder: 'City', cols: 1 },
                  { label: 'State', field: 'state', placeholder: 'State', cols: 1 },
                  { label: 'Pincode', field: 'pincode', placeholder: '110001', cols: 1 },
                ].map(({ label, field, placeholder, cols }) => (
                  <div key={field} className={cols === 2 ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={shipping[field]}
                      onChange={(e) => setShipping({ ...shipping, [field]: e.target.value })}
                      placeholder={placeholder}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!shipping.fullName || !shipping.addressLine1 || !shipping.city || !shipping.pincode}
                className="btn-primary mt-6"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <FiCreditCard size={20} className="text-brand-600" />
                <h2 className="font-bold text-dark-900">Payment Method</h2>
              </div>
              <div className="space-y-3 mb-5">
                {[
                  { id: 'card', label: 'Credit / Debit Card' },
                  { id: 'upi', label: 'UPI' },
                  { id: 'netbanking', label: 'Net Banking' },
                  { id: 'cod', label: 'Cash on Delivery' },
                ].map(({ id, label }) => (
                  <label key={id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    payment.method === id ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={id}
                      checked={payment.method === id}
                      onChange={() => setPayment({ ...payment, method: id })}
                      className="text-brand-600"
                    />
                    <span className="font-medium text-dark-800">{label}</span>
                  </label>
                ))}
              </div>

              {payment.method === 'card' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl mb-5">
                  <div>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">Card Number</label>
                    <input
                      type="text"
                      value={payment.cardNumber}
                      onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="input-field font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1.5">Expiry</label>
                      <input type="text" value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} placeholder="MM/YY" className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1.5">CVV</label>
                      <input type="password" value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="•••" maxLength={4} className="input-field" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary">Back</button>
                <button onClick={() => setStep(2)} className="btn-primary">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-bold text-dark-900 mb-5">Review Your Order</h2>
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={item.images?.[0] || `https://picsum.photos/seed/${item._id}/60/60`} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-gray-50" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-dark-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-dark-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
                <p className="font-medium text-dark-700 mb-2">Delivering to:</p>
                <p className="text-dark-600">{shipping.fullName}</p>
                <p className="text-dark-600">{shipping.addressLine1}{shipping.addressLine2 ? `, ${shipping.addressLine2}` : ''}</p>
                <p className="text-dark-600">{shipping.city}, {shipping.state} - {shipping.pincode}</p>
                <p className="text-dark-600">Phone: {shipping.phone}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : `Place Order · ₹${grandTotal.toLocaleString('en-IN')}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="card p-5 h-fit">
          <h3 className="font-bold text-dark-900 mb-4">Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-dark-600"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-dark-600"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
            <div className="flex justify-between text-dark-600"><span>Tax (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-dark-900 text-base"><span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}