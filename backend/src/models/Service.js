const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false }, // phút
    image: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING }, // ví dụ: "Cắt tóc", "Gội đầu", "Nhuộm", "Uốn"
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isPopular: { type: DataTypes.BOOLEAN, defaultValue: false },
    discountPrice: { type: DataTypes.FLOAT }, // giá khuyến mãi
    discountEndDate: { type: DataTypes.DATEONLY }
});

module.exports = Service;
