const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
    booking_date: { type: DataTypes.DATEONLY, allowNull: false },
    booking_time: { type: DataTypes.TIME, allowNull: false },
    actual_price: { type: DataTypes.FLOAT },
    original_price: { type: DataTypes.FLOAT }, // giá gốc trước khi giảm
    discount_amount: { type: DataTypes.FLOAT, defaultValue: 0 }, // số tiền giảm giá
    status: { 
        type: DataTypes.ENUM('pending', 'confirmed', 'checked_in', 'done', 'cancelled', 'no_show'), 
        defaultValue: 'pending' 
    },
    note: { type: DataTypes.TEXT }, // ghi chú của khách
    cancelReason: { type: DataTypes.TEXT }, // lý do hủy
    cancelledAt: { type: DataTypes.DATE },
    cancelledBy: { type: DataTypes.INTEGER }, // UserId của người hủy
    confirmedAt: { type: DataTypes.DATE },
    checkedInAt: { type: DataTypes.DATE },
    completedAt: { type: DataTypes.DATE },
    paymentMethod: { type: DataTypes.ENUM('cash', 'card', 'online') },
    paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'refunded'), defaultValue: 'pending' },
    reminderSent: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Booking;
