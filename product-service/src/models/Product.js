const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false, validate: { notEmpty: true, len: [2, 255] } },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
  originalPrice: { type: DataTypes.DECIMAL(12, 2), validate: { min: 0 } },
  category: {
    type: DataTypes.ENUM('electronics', 'clothing', 'home', 'sports', 'books', 'beauty', 'other'),
    allowNull: false,
    defaultValue: 'other',
  },
  stock: { type: DataTypes.INTEGER, defaultValue: 0, validate: { min: 0 } },
  images: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  specifications: { type: DataTypes.JSONB, defaultValue: {} },
  tags: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  reviewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isNew: { type: DataTypes.BOOLEAN, defaultValue: true },
  sellerId: { type: DataTypes.UUID },
}, {
  tableName: 'products',
  underscored: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['price'] },
    { fields: ['rating'] },
    { type: 'FULLTEXT', fields: ['name', 'description'] },
  ],
});

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  productId: { type: DataTypes.UUID, allowNull: false, references: { model: 'products', key: 'id' } },
  userId: { type: DataTypes.UUID, allowNull: false },
  userName: { type: DataTypes.STRING, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'reviews',
  underscored: true,
});

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { Product, Review };