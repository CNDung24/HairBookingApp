const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { 
        type: DataTypes.ENUM('booking', 'reminder', 'promotion', 'system', 'review'),
        defaultValue: 'system'
    },
    data: { type: DataTypes.JSON }, // dữ liệu liên quan
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    readAt: { type: DataTypes.DATE },
    isSent: { type: DataTypes.BOOLEAN, defaultValue: false },
    sentAt: { type: DataTypes.DATE },
    scheduledAt: { type: DataTypes.DATE } // gửi lúc nào
});

module.exports = Notification;
