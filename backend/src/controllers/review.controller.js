// backend/src/controllers/review.controller.js
const { Review, Booking, Barber, Shop, User } = require('../models');

exports.create = async (req, res) => {
    try {
        const { bookingId, barberId, shopId, rating, comment } = req.body;
        const userId = req.user.id;

        if (!bookingId || !barberId || !rating) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }

        if (booking.UserId !== userId) {
            return res.status(403).json({ message: 'Bạn chỉ có thể đánh giá booking của mình' });
        }

        if (booking.status !== 'done') {
            return res.status(400).json({ message: 'Chỉ có thể đánh giá sau khi hoàn thành dịch vụ' });
        }

        const existingReview = await Review.findOne({ where: { BookingId: bookingId } });
        if (existingReview) {
            return res.status(400).json({ message: 'Booking này đã được đánh giá' });
        }

        const review = await Review.create({
            rating,
            comment,
            BookingId: bookingId,
            BarberId: barberId,
            ShopId: shopId || booking.ShopId,
            UserId: userId
        });

        await updateBarberRating(barberId);
        await updateShopRating(shopId || booking.ShopId);

        res.status(201).json({ status: 'success', data: review });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getByBarber = async (req, res) => {
    try {
        const { barberId } = req.params;
        
        const reviews = await Review.findAll({
            where: { BarberId: barberId },
            include: [{ model: User, attributes: ['id', 'name', 'avatar'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ status: 'success', data: reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        
        const reviews = await Review.findAll({
            where: { ShopId: shopId },
            include: [
                { model: User, attributes: ['id', 'name', 'avatar'] },
                { model: Barber, attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ status: 'success', data: reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { UserId: req.user.id },
            include: [
                { model: Barber, attributes: ['id', 'name', 'avatar'] },
                { model: Shop, attributes: ['id', 'name'] },
                { model: Service, attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ status: 'success', data: reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ message: 'Review không tồn tại' });
        }

        if (review.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa review này' });
        }

        const barberId = review.BarberId;
        const shopId = review.ShopId;

        await review.destroy();

        await updateBarberRating(barberId);
        await updateShopRating(shopId);

        res.json({ status: 'success', message: 'Xóa review thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

async function updateBarberRating(barberId) {
    const reviews = await Review.findAll({ where: { BarberId: barberId } });
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Barber.update(
            { rating: avgRating.toFixed(1), totalReviews: reviews.length },
            { where: { id: barberId } }
        );
    }
}

async function updateShopRating(shopId) {
    const reviews = await Review.findAll({ where: { ShopId: shopId } });
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Shop.update(
            { rating: avgRating.toFixed(1), totalReviews: reviews.length },
            { where: { id: shopId } }
        );
    }
}
