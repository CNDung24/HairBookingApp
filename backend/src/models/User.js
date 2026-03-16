const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING },
    gender: { type: DataTypes.ENUM('male', 'female', 'other') },
    birthday: { type: DataTypes.DATEONLY },
    address: { type: DataTypes.TEXT },
    role: { 
        type: DataTypes.ENUM('customer', 'admin', 'shop_owner'), 
        defaultValue: 'customer' 
    },
    ShopId: { type: DataTypes.INTEGER, allowNull: true },
    BarberProfileId: { type: DataTypes.INTEGER, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastLogin: { type: DataTypes.DATE },
    resetToken: { type: DataTypes.STRING },
    resetTokenExpiry: { type: DataTypes.DATE }
});

module.exports = User;