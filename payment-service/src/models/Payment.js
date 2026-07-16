const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'INR' },
  method: {
    type: DataTypes.ENUM('card', 'upi', 'netbanking', 'cod', 'refund'),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
    defaultValue: 'pending',
  },
  stripePaymentIntentId: { type: DataTypes.STRING },
  stripeChargeId: { type: DataTypes.STRING },
  gatewayResponse: { type: DataTypes.JSONB, defaultValue: {} },
  refundReason: { type: DataTypes.TEXT },
  refundedAt: { type: DataTypes.DATE },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: 'payments',
  underscored: true,
  indexes: [
    { fields: ['order_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Payment;