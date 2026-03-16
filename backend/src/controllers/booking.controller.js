// backend/src/controllers/booking.controller.js
const { Booking, Shop, Service, Barber, User, WorkingSchedule } = require('../models');
const { Op } = require('sequelize');
const notificationController = require('./notification.controller');

exports.create = async (req, res) => {
    try {
        const { barberId, booking_date, booking_time, ShopId, ServiceId } = req.body;

        if (!barberId || !booking_date || !booking_time || !ShopId || !ServiceId) {
            return res.status(400).json({ message: 'Missing required fields (barber, date, time, shop, service)' });
        }

        // Kiểm tra ngày không được trong quá khứ
        const today = new Date().toISOString().slice(0, 10);
        if (booking_date < today) {
            return res.status(400).json({ message: 'Cannot book for past dates' });
        }

        // Kiểm tra Barber tồn tại và đang hoạt động
        const barber = await Barber.findByPk(barberId);
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        if (!barber.isActive) {
            return res.status(400).json({ message: 'Barber is currently inactive' });
        }
        if (!barber.isAvailable) {
            return res.status(400).json({ message: 'Barber is not available for booking' });
        }

        // Kiểm tra Service tồn tại và đang hoạt động
        const service = await Service.findByPk(ServiceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (!service.isActive) {
            return res.status(400).json({ message: 'Service is currently unavailable' });
        }

        // Kiểm tra thợ có làm việc vào ngày đó không
        const dayOfWeek = new Date(booking_date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const schedule = await WorkingSchedule.findOne({
            where: {
                BarberId: barberId,
                [Op.or]: [
                    { dayOfWeek: dayOfWeek },
                    { specificDate: booking_date }
                ]
            }
        });

        if (schedule && !schedule.isWorking) {
            return res.status(400).json({ message: 'Barber does not work on this day' });
        }

        if (schedule && schedule.isOff) {
            return res.status(400).json({ message: 'Barber is off on this day' });
        }

        // Kiểm tra giờ đặt có nằm trong giờ làm việc không
        if (schedule) {
            const timeHour = parseInt(booking_time.split(':')[0]);
            const startHour = parseInt(schedule.startTime.split(':')[0]);
            const endHour = parseInt(schedule.endTime.split(':')[0]);
            
            if (timeHour < startHour || timeHour >= endHour) {
                return res.status(400).json({ message: 'Booking time is outside working hours' });
            }

            // Kiểm tra giờ nghỉ trưa
            if (schedule.breakStart && schedule.breakEnd) {
                const breakStartHour = parseInt(schedule.breakStart.split(':')[0]);
                const breakEndHour = parseInt(schedule.breakEnd.split(':')[0]);
                if (timeHour >= breakStartHour && timeHour < breakEndHour) {
                    return res.status(400).json({ message: 'Barber is on break during this time' });
                }
            }
        }

        // Kiểm tra slot đã được đặt chưa
        const existed = await Booking.findOne({
            where: {
                BarberId: barberId,
                booking_date,
                booking_time,
                status: { [Op.in]: ['pending', 'confirmed', 'checked_in'] }
            }
        });

        if (existed) {
            return res.status(400).json({ message: 'Slot already booked. Please choose another time.' });
        }

        const original_price = service?.discountPrice || service?.price || 0;
        let discount_amount = 0;

        const booking = await Booking.create({
            booking_date,
            booking_time,
            original_price,
            actual_price: original_price - discount_amount,
            discount_amount,
            UserId: req.user.id,
            ShopId: ShopId,
            ServiceId: ServiceId,
            BarberId: barberId,
            status: 'pending'
        });

        await notificationController.sendBookingNotification(booking.id, 'created');

        res.status(201).json(booking);

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { UserId: req.user.id },
            include: [
                { model: Shop },
                { model: Service },
                { model: Barber }
            ],
            order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'phone'] },
                { model: Shop },
                { model: Service },
                { model: Barber }
            ],
            order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBarberAppointments = async (req, res) => {
    try {
        let barberId = req.query.barberId;
        
        console.log('req.user:', req.user);
        
        if (!barberId && req.user.role === 'barber') {
            console.log('Looking up barber profile for user:', req.user.id);
            // The relationship is Barber.UserId → User, so we find the Barber record by UserId
            const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
            console.log('Barber profile found:', barberProfile ? barberProfile.id : null);
            barberId = barberProfile?.id;
        }
        
        if (!barberId) {
            return res.status(400).json({ message: 'Barber profile not found for this user' });
        }
        
        console.log('Fetching bookings for barberId:', barberId);
        
        // Simple query without include first to debug
        const bookings = await Booking.findAll({
            where: { BarberId: barberId },
            order: [['booking_date', 'ASC'], ['booking_time', 'ASC']]
        });
        
        // Manually fetch related data
        const bookingsWithRelations = await Promise.all(bookings.map(async (booking) => {
            const data = booking.toJSON();
            if (booking.UserId) {
                const user = await User.findByPk(booking.UserId, { attributes: ['id', 'name', 'email', 'phone'] });
                data.User = user;
            }
            if (booking.ServiceId) {
                const service = await Service.findByPk(booking.ServiceId);
                data.Service = service;
            }
            if (booking.ShopId) {
                const shop = await Shop.findByPk(booking.ShopId);
                data.Shop = shop;
            }
            return data;
        }));
        
        res.json(bookingsWithRelations);
    } catch (error) {
        console.error('Error in getBarberAppointments:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const { barberId, date } = req.query;

        if (!barberId || !date) {
            return res.status(400).json({ message: 'barberId and date are required' });
        }

        // Kiểm tra ngày không được trong quá khứ
        const today = new Date().toISOString().slice(0, 10);
        if (date < today) {
            return res.status(400).json({ message: 'Cannot view slots for past dates' });
        }

        // Lấy lịch làm việc của thợ
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        let schedule = await WorkingSchedule.findOne({
            where: {
                BarberId: barberId,
                [Op.or]: [
                    { dayOfWeek: dayOfWeek },
                    { specificDate: date }
                ]
            }
        });

        // Nếu không có lịch, dùng giờ mặc định (9h - 18h)
        let startHour = 9;
        let endHour = 18;
        let breakStart = null;
        let breakEnd = null;

        if (schedule) {
            // Nếu có lịch nhưng nghỉ
            if (!schedule.isWorking || schedule.isOff) {
                return res.json({ status: 'success', data: [], message: 'Barber is off on this day' });
            }
            startHour = parseInt(schedule.startTime.split(':')[0]);
            endHour = parseInt(schedule.endTime.split(':')[0]);
            breakStart = schedule.breakStart;
            breakEnd = schedule.breakEnd;
        }

        // Tạo mảng giờ từ start đến end
        const allSlots = [];
        for (let hour = startHour; hour < endHour; hour++) {
            allSlots.push(hour.toString().padStart(2, '0') + ':00');
        }

        // Lọc bỏ giờ nghỉ trưa
        let availableSlots = allSlots;
        if (breakStart && breakEnd) {
            const breakStartHour = parseInt(breakStart.split(':')[0]);
            const breakEndHour = parseInt(breakEnd.split(':')[0]);
            availableSlots = allSlots.filter(hour => {
                const h = parseInt(hour.split(':')[0]);
                return h < breakStartHour || h >= breakEndHour;
            });
        }

        // Lấy các slot đã được đặt
        const bookedSlots = await Booking.findAll({
            where: { 
                BarberId: barberId, 
                booking_date: date, 
                status: { [Op.in]: ['pending', 'confirmed', 'checked_in'] }
            },
            attributes: ['booking_time']
        });

        const occupiedTimes = bookedSlots.map(b => b.booking_time.substring(0, 5));
        const freeSlots = availableSlots.filter(slot => !occupiedTimes.includes(slot));

        res.json({ status: 'success', data: freeSlots });
    } catch (error) {
        console.error('Error getAvailableSlots:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only cancel your own bookings' });
        }

        if (['done', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date();
        booking.cancelledBy = req.user.id;
        await booking.save();

        await notificationController.sendBookingNotification(booking.id, 'cancelled');

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'checked_in';
        await booking.save();

        res.json({ message: 'Checked in successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.completeBooking = async (req, res) => {
    try {
        const { actual_price } = req.body;
        const booking = await Booking.findByPk(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = 'done';
        booking.completedAt = new Date();
        if (actual_price) {
            booking.actual_price = actual_price;
        }
        await booking.save();

        await notificationController.sendBookingNotification(booking.id, 'completed');

        res.json({ message: 'Booking completed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status, actual_price } = req.body;
    try {
        const booking = await Booking.findByPk(id);
        if (!booking) return res.status(404).json({ message: 'Không tìm thấy lịch' });

        const oldStatus = booking.status;
        booking.status = status;
        
        if (status === 'confirmed') {
            booking.confirmedAt = new Date();
        }
        
        if (status === 'done' && actual_price) {
            booking.actual_price = actual_price;
            booking.completedAt = new Date();
        }

        await booking.save();

        if (status === 'confirmed' && oldStatus !== 'confirmed') {
            await notificationController.sendBookingNotification(booking.id, 'confirmed');
        } else if (status === 'done' && oldStatus !== 'done') {
            await notificationController.sendBookingNotification(booking.id, 'completed');
        }

        res.json({ status: 'success', data: booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
