const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shop = sequelize.define('Shop', {
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    logo: { type: DataTypes.STRING },
    description: { type: DataTypes.TEXT },
    city: { type: DataTypes.STRING },
    district: { type: DataTypes.STRING },
    ward: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT },
    longitude: { type: DataTypes.FLOAT },
    openingTime: { type: DataTypes.STRING }, // ví dụ: "09:00"
    closingTime: { type: DataTypes.STRING }, // ví dụ: "21:00"
    isOpen: { type: DataTypes.BOOLEAN, defaultValue: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalBookings: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Shop;
