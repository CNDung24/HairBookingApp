const { Booking, User, Service, Barber } = require('../models');
const { Op } = require('sequelize');

// Xem lịch làm việc của chính mình
exports.getMySchedule = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;

        const bookings = await Booking.findAll({
            where: { BarberId: barberId },
            include: [{ model: User, attributes: ['name', 'phone'] }, { model: Service }],
            order: [['booking_date', 'ASC'], ['booking_time', 'ASC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xử lý booking (Accept/Reject/Done)
exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'confirmed', 'cancelled', 'done'
        const booking = await Booking.findByPk(req.params.id);

        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = status;
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xem thu nhập theo ngày
exports.getIncome = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;
        
        const today = new Date().toISOString().slice(0, 10);

        const bookings = await Booking.findAll({
            where: {
                BarberId: barberId,
                status: 'done',
                booking_date: today
            },
            include: [Service]
        });

        // Sửa: Dùng actual_price thay vì Service.price
        const dailyIncome = bookings.reduce((sum, b) => sum + (b.actual_price || 0), 0);
        res.json({ dailyIncome, count: bookings.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xem thu nhập theo tuần
exports.getWeeklyIncome = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;

        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        const bookings = await Booking.findAll({
            where: {
                BarberId: barberId,
                status: 'done',
                booking_date: { [Op.between]: [weekAgo.toISOString().slice(0, 10), today.toISOString().slice(0, 10)] }
            }
        });

        const weeklyIncome = bookings.reduce((sum, b) => sum + (b.actual_price || 0), 0);
        res.json({ weeklyIncome, count: bookings.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xem thu nhập theo tháng
exports.getMonthlyIncome = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;

        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);

        const bookings = await Booking.findAll({
            where: {
                BarberId: barberId,
                status: 'done',
                booking_date: { [Op.between]: [monthAgo.toISOString().slice(0, 10), today.toISOString().slice(0, 10)] }
            }
        });

        const monthlyIncome = bookings.reduce((sum, b) => sum + (b.actual_price || 0), 0);
        res.json({ monthlyIncome, count: bookings.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};