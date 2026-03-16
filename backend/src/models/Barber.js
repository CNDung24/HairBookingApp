const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Barber = sequelize.define('Barber', {
    name: { type: DataTypes.STRING, allowNull: false },
    avatar: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    specialty: { type: DataTypes.STRING }, // ví dụ: "Cắt tóc nam", "Nhuộm tóc"
    experience: { type: DataTypes.INTEGER }, // số năm kinh nghiệm
    bio: { type: DataTypes.TEXT }, // giới thiệu bản thân
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalCustomers: { type: DataTypes.INTEGER, defaultValue: 0 },
    joinDate: { type: DataTypes.DATEONLY },
    ShopId: { type: DataTypes.INTEGER, allowNull: true }, // Cửa hàng mà thợ làm việc
    UserId: { type: DataTypes.INTEGER, allowNull: true }  // Liên kết với tài khoản User để đăng nhập
});

module.exports = Barber;
