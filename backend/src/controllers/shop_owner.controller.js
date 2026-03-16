// backend/src/controllers/shop_owner.controller.js
const { Shop, Barber, Service, Review, User, Booking, WorkingSchedule } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Lấy thông tin shop mà shop_owner quản lý
exports.getMyShop = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const shop = await Shop.findByPk(user.ShopId, {
            include: [
                { model: Barber },
                { model: Service }
            ]
        });

        if (!shop) {
            return res.status(404).json({ message: 'Shop không tồn tại' });
        }

        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thông tin shop
exports.updateMyShop = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const shop = await Shop.findByPk(user.ShopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop không tồn tại' });
        }

        await shop.update(req.body);
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== QUẢN LÝ DỊCH VỤ =====

// Lấy danh sách dịch vụ của shop
exports.getMyServices = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const services = await Service.findAll({ where: { ShopId: user.ShopId } });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo dịch vụ mới
exports.createService = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const service = await Service.create({
            ...req.body,
            ShopId: user.ShopId
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const service = await Service.findOne({
            where: { id: req.params.id, ShopId: user.ShopId }
        });

        if (!service) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
        }

        await service.update(req.body);
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const service = await Service.findOne({
            where: { id: req.params.id, ShopId: user.ShopId }
        });

        if (!service) {
            return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
        }

        await service.destroy();
        res.json({ message: 'Dịch vụ đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== QUẢN LÝ THỢ =====

// Lấy danh sách thợ của shop
exports.getMyBarbers = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const barbers = await Barber.findAll({ where: { ShopId: user.ShopId } });
        res.json(barbers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thợ mới (chỉ tạo barber profile, không tạo user)
exports.createBarber = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const { name, phone, avatar, specialty, experience, bio } = req.body;

        // Tạo barber profile (không tạo user)
        const barber = await Barber.create({
            name,
            avatar,
            phone,
            specialty,
            experience,
            bio,
            ShopId: user.ShopId,
            UserId: null
        });

        res.status(201).json(barber);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thợ
exports.updateBarber = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const barber = await Barber.findOne({
            where: { id: req.params.id, ShopId: user.ShopId }
        });

        if (!barber) {
            return res.status(404).json({ message: 'Thợ không tồn tại' });
        }

        // Không cho phép thay đổi ShopId
        const { ShopId, UserId, ...updateData } = req.body;
        await barber.update(updateData);

        res.json(barber);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa thợ
exports.deleteBarber = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const barber = await Barber.findOne({
            where: { id: req.params.id, ShopId: user.ShopId }
        });

        if (!barber) {
            return res.status(404).json({ message: 'Thợ không tồn tại' });
        }

        // Xóa user liên kết nếu có
        if (barber.UserId) {
            const relatedUser = await User.findByPk(barber.UserId);
            if (relatedUser) {
                relatedUser.role = 'customer';
                relatedUser.BarberProfileId = null;
                await relatedUser.save();
            }
        }

        await barber.destroy();
        res.json({ message: 'Thợ đã được xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== QUẢN LÝ BOOKING =====

// Lấy danh sách booking của shop
exports.getMyShopBookings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const { status, date } = req.query;
        const where = { ShopId: user.ShopId };

        if (status && status !== 'all') where.status = status;
        if (date) where.booking_date = date;

        const bookings = await Booking.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'phone'] },
                { model: Barber, attributes: ['id', 'name'] },
                { model: Service, attributes: ['id', 'name', 'price'] }
            ],
            order: [['booking_date', 'DESC'], ['booking_time', 'DESC']]
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái booking
exports.updateBookingStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const booking = await Booking.findOne({
            where: { id: req.params.id, ShopId: user.ShopId }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }

        const { status, actual_price } = req.body;
        booking.status = status;
        
        if (status === 'confirmed') {
            booking.confirmedAt = new Date();
        } else if (status === 'checked_in') {
            booking.checkedInAt = new Date();
        } else if (status === 'done') {
            booking.completedAt = new Date();
            if (actual_price) booking.actual_price = actual_price;
        } else if (status === 'cancelled') {
            booking.cancelledAt = new Date();
            booking.cancelledBy = user.id;
        }

        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== QUẢN LÝ ĐÁNH GIÁ =====

// Lấy đánh giá của shop
exports.getMyShopReviews = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const reviews = await Review.findAll({
            where: { ShopId: user.ShopId },
            include: [
                { model: User, attributes: ['id', 'name', 'avatar'] },
                { model: Barber, attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Phản hồi đánh giá
exports.replyReview = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const review = await Review.findOne({
            where: { id: req.params.id, ShopId: user.ShopId }
        });

        if (!review) {
            return res.status(404).json({ message: 'Đánh giá không tồn tại' });
        }

        const { reply } = req.body;
        review.reply = reply;
        review.repliedAt = new Date();
        await review.save();

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===== THỐNG KÊ =====

// Lấy thống kê của shop
exports.getMyShopStats = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user.ShopId) {
            return res.status(404).json({ message: 'Bạn chưa được assign shop nào' });
        }

        const totalBookings = await Booking.count({ where: { ShopId: user.ShopId } });
        const completedBookings = await Booking.count({ where: { ShopId: user.ShopId, status: 'done' } });
        const pendingBookings = await Booking.count({ where: { ShopId: user.ShopId, status: 'pending' } });
        const totalBarbers = await Barber.count({ where: { ShopId: user.ShopId } });
        const totalServices = await Service.count({ where: { ShopId: user.ShopId } });
        const totalReviews = await Review.count({ where: { ShopId: user.ShopId } });

        const revenueResult = await Booking.sum('actual_price', { 
            where: { ShopId: user.ShopId, status: 'done' }
        });

        res.json({
            totalBookings,
            completedBookings,
            pendingBookings,
            totalBarbers,
            totalServices,
            totalReviews,
            totalRevenue: revenueResult || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
