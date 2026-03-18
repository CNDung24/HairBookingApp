const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth.routes');
const shopRoutes = require('./routes/shop.routes');
const bookingRoutes = require('./routes/booking.routes');
const barberRoutes = require('./routes/barber.routes');
const adminRoutes = require('./routes/admin.routes');
const shopOwnerRoutes = require('./routes/shop_owner.routes');
const serviceRoutes = require('./routes/service.routes');
const workingScheduleRoutes = require('./routes/workingSchedule.routes');
const paymentRoutes = require('./routes/payment.routes');
const shopRequestRoutes = require('./routes/shopRequest.routes');
const reviewRoutes = require('./routes/review.routes');
const notificationRoutes = require('./routes/notification.routes');
const uploadRoutes = require('./routes/upload.routes');
const bannerRoutes = require('./routes/banner.routes');

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount Routes
app.get('/', (req, res) => {
    res.send('Hair Booking API is running successfully! 🚀');
});
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/barber', barberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shop-owner', shopOwnerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/schedule', workingScheduleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shop-requests', shopRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', bannerRoutes);

// Sync Database (non-destructive)
sequelize.sync({ force: false })
    .then(() => console.log('Database synced'))
    .catch(err => console.log(err));

module.exports = app;