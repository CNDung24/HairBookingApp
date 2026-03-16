const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopRequest = sequelize.define('ShopRequest', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    openingTime: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    closingTime: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    logo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    rejectReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    tableName: 'ShopRequests',
    timestamps: true
});

module.exports = ShopRequest;
