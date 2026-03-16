const sequelize = require('../config/database');

const User = require('./User');
const Shop = require('./Shop');
const Barber = require('./Barber');
const Service = require('./Service');
const Booking = require('./Booking');
const Review = require('./Review');
const WorkingSchedule = require('./WorkingSchedule');
const Notification = require('./Notification');
const Payment = require('./Payment');
const ShopRequest = require('./ShopRequest');

// =======================
// RELATIONSHIPS
// =======================

// Shop & Barber
Shop.hasMany(Barber, { foreignKey: 'ShopId' });
Barber.belongsTo(Shop, { foreignKey: 'ShopId' });

// Shop & Service
Shop.hasMany(Service, { foreignKey: 'ShopId' });
Service.belongsTo(Shop, { foreignKey: 'ShopId' });

// Barber & WorkingSchedule
Barber.hasMany(WorkingSchedule, { foreignKey: 'BarberId' });
WorkingSchedule.belongsTo(Barber, { foreignKey: 'BarberId' });

// Booking Relations
User.hasMany(Booking, { foreignKey: 'UserId' });
Booking.belongsTo(User, { foreignKey: 'UserId' });

Shop.hasMany(Booking, { foreignKey: 'ShopId' });
Booking.belongsTo(Shop, { foreignKey: 'ShopId' });

Barber.hasMany(Booking, { foreignKey: 'BarberId' });
Booking.belongsTo(Barber, { foreignKey: 'BarberId' });

Service.hasMany(Booking, { foreignKey: 'ServiceId' });
Booking.belongsTo(Service, { foreignKey: 'ServiceId' });

// Review Relations
User.hasMany(Review, { foreignKey: 'UserId' });
Review.belongsTo(User, { foreignKey: 'UserId' });

Barber.hasMany(Review, { foreignKey: 'BarberId' });
Review.belongsTo(Barber, { foreignKey: 'BarberId' });

Shop.hasMany(Review, { foreignKey: 'ShopId' });
Review.belongsTo(Shop, { foreignKey: 'ShopId' });

Booking.hasMany(Review, { foreignKey: 'BookingId' });
Review.belongsTo(Booking, { foreignKey: 'BookingId' });

// Notification Relations
User.hasMany(Notification, { foreignKey: 'UserId' });
Notification.belongsTo(User, { foreignKey: 'UserId' });

// User - Barber (User có thể là thợ)
// User.BarberProfileId trỏ đến Barber.id
User.belongsTo(Barber, { foreignKey: 'BarberProfileId', as: 'barberProfile' });
// Barber.UserId trỏ đến User.id (để đăng nhập)
Barber.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
User.hasOne(Barber, { foreignKey: 'UserId', as: 'barberProfileByUserId' });

// User - Shop (Shop Owner quản lý shop)
User.belongsTo(Shop, { foreignKey: 'ShopId', as: 'shop' });
Shop.hasMany(User, { foreignKey: 'ShopId', as: 'staffs' });

// Payment Relations
Booking.hasOne(Payment, { foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });

// ShopRequest Relations
User.hasMany(ShopRequest, { foreignKey: 'UserId' });
ShopRequest.belongsTo(User, { foreignKey: 'UserId' });

module.exports = {
    sequelize, 
    User, 
    Shop, 
    Barber, 
    Service, 
    Booking, 
    Review,
    WorkingSchedule,
    Notification,
    Payment,
    ShopRequest
};