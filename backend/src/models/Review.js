const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT },
    images: { type: DataTypes.JSON }, // mảng ảnh đánh giá
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }, // đánh giá đã xác nhận
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    staffRating: { type: DataTypes.INTEGER }, // đánh giá về thái độ thợ
    serviceRating: { type: DataTypes.INTEGER }, // đánh giá về chất lượng dịch vụ
    environmentRating: { type: DataTypes.INTEGER }, // đánh giá về không gian
    reply: { type: DataTypes.TEXT }, // phản hồi từ tiệm
    repliedAt: { type: DataTypes.DATE },
    ShopId: { type: DataTypes.INTEGER, allowNull: true }, // Shop được đánh giá
    BookingId: { type: DataTypes.INTEGER, allowNull: true } // Booking gắn với đánh giá
});

module.exports = Review;