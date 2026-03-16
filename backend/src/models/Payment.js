const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
    amount: { type: DataTypes.FLOAT, allowNull: false },
    method: { 
        type: DataTypes.ENUM('cash', 'momo', 'vnpay', 'zalopay'), 
        allowNull: false 
    },
    status: { 
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), 
        defaultValue: 'pending' 
    },
    transactionId: { type: DataTypes.STRING }, // ID giao dịch từ MoMo/VNPay
    paymentUrl: { type: DataTypes.STRING }, // URL thanh toán
    callbackData: { type: DataTypes.JSON }, // Dữ liệu callback từ payment provider
    paidAt: { type: DataTypes.DATE },
    bookingId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Payment;
