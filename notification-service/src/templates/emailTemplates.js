// src/templates/emailTemplates.js

const baseStyle = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  color: #1e2028;
`;

const btnStyle = `
  display: inline-block;
  background-color: #d63525;
  color: #ffffff;
  padding: 12px 28px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  margin: 16px 0;
`;

const header = (title) => `
  <div style="background: linear-gradient(135deg, #1e2028 0%, #2d3748 100%); padding: 32px 40px; border-radius: 16px 16px 0 0;">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
      <div style="width:32px; height:32px; background:#d63525; border-radius:8px; display:inline-flex; align-items:center; justify-content:center;">
        <span style="color:#fff; font-weight:bold; font-size:14px;">S</span>
      </div>
      <span style="color:#ffffff; font-size:22px; font-weight:700;">ShopNest</span>
    </div>
    <h1 style="color:#ffffff; margin:0; font-size:20px; font-weight:600;">${title}</h1>
  </div>
`;

const footer = () => `
  <div style="background:#f6f6f7; padding:24px 40px; border-radius:0 0 16px 16px; text-align:center;">
    <p style="color:#777f8e; font-size:12px; margin:0;">
      © 2026 ShopNest · Ludhiana, Punjab, India<br>
      You're receiving this because you made a purchase at ShopNest.
    </p>
  </div>
`;

const templates = {
  orderConfirmation: ({ firstName, orderId, items = [], total, estimatedDelivery }) => ({
    subject: `Order Confirmed! #${String(orderId).slice(-8).toUpperCase()} 🎉`,
    html: `
      <div style="${baseStyle}">
        ${header('Your order is confirmed!')}
        <div style="background:#ffffff; padding:32px 40px;">
          <p style="font-size:16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color:#5c6474;">Great news! We've received your order and it's being processed.</p>

          <div style="background:#fef3f2; border:1px solid #fccfc9; border-radius:12px; padding:16px 20px; margin:20px 0;">
            <p style="margin:0; font-size:13px; color:#b3281b;">
              📦 Order ID: <strong>#${String(orderId).slice(-8).toUpperCase()}</strong>
            </p>
          </div>

          <h3 style="font-size:14px; color:#5c6474; text-transform:uppercase; letter-spacing:0.5px;">Items Ordered</h3>
          <table style="width:100%; border-collapse:collapse;">
            ${items.map((item) => `
              <tr style="border-bottom:1px solid #e1e3e7;">
                <td style="padding:10px 0; font-size:14px;">${item.name || 'Product'}</td>
                <td style="padding:10px 0; font-size:14px; color:#777f8e;">×${item.quantity}</td>
                <td style="padding:10px 0; font-size:14px; text-align:right; font-weight:600;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="2" style="padding:12px 0 0; font-weight:700; font-size:15px;">Total</td>
              <td style="padding:12px 0 0; font-weight:700; font-size:15px; text-align:right; color:#d63525;">₹${total?.toLocaleString('en-IN')}</td>
            </tr>
          </table>

          ${estimatedDelivery ? `<p style="color:#5c6474; font-size:14px; margin-top:20px;">🚚 Estimated delivery: <strong>${new Date(estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>` : ''}

          <a href="http://localhost:3000/orders/${orderId}/track" style="${btnStyle}">Track Your Order</a>
        </div>
        ${footer()}
      </div>
    `,
  }),

  orderShipped: ({ firstName, orderId, trackingNumber }) => ({
    subject: `Your order has shipped! 🚚 #${String(orderId).slice(-8).toUpperCase()}`,
    html: `
      <div style="${baseStyle}">
        ${header('Your order is on its way!')}
        <div style="background:#ffffff; padding:32px 40px;">
          <p style="font-size:16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color:#5c6474;">Your order has been shipped and is on its way to you!</p>
          ${trackingNumber ? `<p style="color:#5c6474;">Tracking number: <strong>${trackingNumber}</strong></p>` : ''}
          <a href="http://localhost:3000/orders/${orderId}/track" style="${btnStyle}">Track Shipment</a>
        </div>
        ${footer()}
      </div>
    `,
  }),

  orderDelivered: ({ firstName, orderId }) => ({
    subject: `Order delivered! Rate your experience ⭐ #${String(orderId).slice(-8).toUpperCase()}`,
    html: `
      <div style="${baseStyle}">
        ${header('Order Delivered Successfully!')}
        <div style="background:#ffffff; padding:32px 40px;">
          <p style="font-size:16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color:#5c6474;">Your order has been delivered. We hope you love it!</p>
          <p style="color:#5c6474;">Please take a moment to rate your experience.</p>
          <a href="http://localhost:3000/products" style="${btnStyle}">Rate Your Purchase</a>
        </div>
        ${footer()}
      </div>
    `,
  }),

  welcome: ({ firstName, email }) => ({
    subject: `Welcome to ShopNest, ${firstName}! 🛍️`,
    html: `
      <div style="${baseStyle}">
        ${header(`Welcome, ${firstName}!`)}
        <div style="background:#ffffff; padding:32px 40px;">
          <p style="font-size:16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color:#5c6474;">
            Welcome to ShopNest! Your account has been created with <strong>${email}</strong>.
          </p>
          <p style="color:#5c6474;">Start exploring thousands of products with fast delivery across India.</p>
          <a href="http://localhost:3000/products" style="${btnStyle}">Start Shopping</a>
        </div>
        ${footer()}
      </div>
    `,
  }),

  passwordChanged: ({ firstName }) => ({
    subject: 'Your ShopNest password was changed',
    html: `
      <div style="${baseStyle}">
        ${header('Password Changed')}
        <div style="background:#ffffff; padding:32px 40px;">
          <p style="font-size:16px;">Hi <strong>${firstName}</strong>,</p>
          <p style="color:#5c6474;">Your password was recently changed. If you didn't do this, please contact support immediately.</p>
        </div>
        ${footer()}
      </div>
    `,
  }),
};

module.exports = templates;