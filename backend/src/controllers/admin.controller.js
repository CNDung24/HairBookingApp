const { User, Barber, Shop, Booking, Service, Review, ShopRequest } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalShops = await Shop.count();
        const totalBarbers = await Barber.count();
        const totalUsers = await User.count({ where: { role: 'customer' } });
        const totalBookings = await Booking.count();
        
        const completedBookings = await Booking.count({ where: { status: 'done' } });
        const pendingBookings = await Booking.count({ where: { status: 'pending' } });
        
        const revenueResult = await Booking.sum('actual_price', { 
            where: { status: 'done' }
        });
        
        const recentBookings = await Booking.findAll({
            limit: 10,
            include: [
                { model: User, attributes: ['name', 'email'] },
                { model: Shop, attributes: ['name'] },
                { model: Barber, attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            totalShops,
            totalBarbers,
            totalUsers,
            totalBookings,
            completedBookings,
            pendingBookings,
            totalRevenue: revenueResult || 0,
            recentBookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllShops = async (req, res) => {
    try {
        const shops = await Shop.findAll({
            include: [{ model: Barber }, { model: Service }],
            order: [['createdAt', 'DESC']]
        });
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBarbers = async (req, res) => {
    try {
        const barbers = await Barber.findAll({
            include: [{ model: Shop }],
            order: [['createdAt', 'DESC']]
        });
        res.json(barbers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createShop = async (req, res) => {
    try {
        const shop = await Shop.create(req.body);
        res.status(201).json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        await user.update(req.body);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const { status, date, shopId } = req.query;
        const where = {};
        
        if (status) where.status = status;
        if (date) where.booking_date = date;
        if (shopId) where.ShopId = shopId;

        const bookings = await Booking.findAll({
            where,
            include: [
                { model: User, attributes: ['id', 'name', 'email', 'phone'] },
                { model: Shop, attributes: ['id', 'name'] },
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

exports.updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findByPk(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        const { status, actual_price } = req.body;
        booking.status = status;
        if (actual_price) booking.actual_price = actual_price;
        
        await booking.save();
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllShopRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        
        if (status) where.status = status;

        const requests = await ShopRequest.findAll({
            where,
            include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShopRequestById = async (req, res) => {
    try {
        const request = await ShopRequest.findByPk(req.params.id, {
            include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'] }]
        });

        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu không tìm thấy' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.approveShopRequest = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const request = await ShopRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu không tìm thấy' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
        }

        if (!request.UserId) {
            return res.status(400).json({ message: 'Yêu cầu không có thông tin user' });
        }

        const user = await User.findByPk(request.UserId);
        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại' });
        }

        const shop = await Shop.create({
            name: request.name,
            address: request.address,
            city: request.city,
            phone: request.phone,
            email: request.email,
            description: request.description,
            openingTime: request.openingTime,
            closingTime: request.closingTime,
            logo: request.logo,
            image: request.image,
            rating: 0,
            totalReviews: 0,
            totalBookings: 0
        }, { transaction });

        await user.update({
            role: 'shop_owner',
            ShopId: shop.id
        }, { transaction });

        await ShopRequest.update(
            { status: 'approved' },
            { where: { id: request.id }, transaction }
        );

        await transaction.commit();

        res.json({
            message: 'Yêu cầu đã được duyệt, shop đã được tạo',
            shop
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Approve shop request error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.rejectShopRequest = async (req, res) => {
    try {
        const { rejectReason } = req.body;

        const request = await ShopRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu không tìm thấy' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
        }

        await request.update({
            status: 'rejected',
            rejectReason: rejectReason || 'Yêu cầu không được duyệt'
        });

        res.json({
            message: 'Yêu cầu đã bị từ chối',
            request
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};