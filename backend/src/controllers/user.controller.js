// backend/src/controllers/user.controller.js
const { User, Review, Booking, Barber, Shop } = require('../models');
const { Op } = require('sequelize');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, avatar, address, gender, birthday } = req.body;
        const user = await User.findByPk(req.user.id);

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;
        if (address) user.address = address;
        if (gender) user.gender = gender;
        if (birthday) user.birthday = birthday;

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { bookingId, barberId, rating, comment, staffRating, serviceRating, environmentRating, images } = req.body;
        const userId = req.user.id;

        // Kiểm tra booking tồn tại và đã hoàn thành
        const booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }

        if (booking.UserId !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền đánh giá booking này' });
        }

        if (booking.status !== 'done') {
            return res.status(400).json({ message: 'Chỉ đánh giá được sau khi hoàn thành dịch vụ' });
        }

        // Kiểm tra đã đánh giá chưa
        const existingReview = await Review.findOne({ where: { BookingId: bookingId } });
        if (existingReview) {
            return res.status(400).json({ message: 'Bạn đã đánh giá booking này rồi' });
        }

        // Lấy ShopId từ booking
        const shopId = booking.ShopId;

        // Tạo review
        const review = await Review.create({
            UserId: userId,
            BarberId: barberId,
            ShopId: shopId,
            BookingId: bookingId,
            rating,
            comment,
            staffRating,
            serviceRating,
            environmentRating,
            images: images ? JSON.stringify(images) : null,
            isVerified: true
        });

        // Cập nhật rating cho Barber
        if (barberId) {
            const barberReviews = await Review.findAll({ where: { BarberId: barberId } });
            const avgRating = barberReviews.reduce((sum, r) => sum + r.rating, 0) / barberReviews.length;
            await Barber.update(
                { rating: avgRating, totalReviews: barberReviews.length },
                { where: { id: barberId } }
            );
        }

        // Cập nhật rating cho Shop
        if (shopId) {
            const shopReviews = await Review.findAll({ where: { ShopId: shopId } });
            const avgRating = shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length;
            await Shop.update(
                { rating: avgRating, totalReviews: shopReviews.length },
                { where: { id: shopId } }
            );
        }

        res.status(201).json({ status: 'success', message: 'Đánh giá đã được gửi', data: review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { UserId: req.user.id },
            include: [{ model: Barber, attributes: ['name'] }]
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};