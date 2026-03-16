// backend/src/controllers/payment.controller.js
const { Payment, Booking, User, Shop, Service, Barber } = require('../models');

// Tạo thanh toán tiền mặt
exports.createCashPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const booking = await Booking.findByPk(bookingId, {
            include: [Service]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }

        if (booking.UserId !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền thanh toán booking này' });
        }

        if (booking.paymentStatus === 'paid') {
            return res.status(400).json({ message: 'Booking đã được thanh toán' });
        }

        const payment = await Payment.create({
            amount: booking.actual_price,
            method: 'cash',
            status: 'pending',
            bookingId: bookingId
        });

        res.status(201).json({ status: 'success', data: payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thanh toán MoMo
exports.createMoMoPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const booking = await Booking.findByPk(bookingId, {
            include: [Service, Shop]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }

        if (booking.UserId !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền thanh toán booking này' });
        }

        // Tạo payment record
        const payment = await Payment.create({
            amount: booking.actual_price,
            method: 'momo',
            status: 'pending',
            bookingId: bookingId
        });

        // Mock MoMo payment URL - thay bằng tích hợp thực tế
        const mockPaymentUrl = `https://momo.vn/pay?amount=${booking.actual_price}&bookingId=${bookingId}&paymentId=${payment.id}`;
        
        payment.paymentUrl = mockPaymentUrl;
        await payment.save();

        res.status(201).json({ 
            status: 'success', 
            data: {
                paymentId: payment.id,
                paymentUrl: mockPaymentUrl,
                amount: payment.amount,
                message: 'Vui lòng thanh toán qua MoMo'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thanh toán VNPay
exports.createVNPayPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const booking = await Booking.findByPk(bookingId, {
            include: [Service, Shop]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }

        if (booking.UserId !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền thanh toán booking này' });
        }

        const payment = await Payment.create({
            amount: booking.actual_price,
            method: 'vnpay',
            status: 'pending',
            bookingId: bookingId
        });

        // Mock VNPay payment URL - thay bằng tích hợp thực tế
        const mockPaymentUrl = `https://vnpay.vn/pay?amount=${booking.actual_price}&bookingId=${bookingId}&paymentId=${payment.id}`;
        
        payment.paymentUrl = mockPaymentUrl;
        await payment.save();

        res.status(201).json({ 
            status: 'success', 
            data: {
                paymentId: payment.id,
                paymentUrl: mockPaymentUrl,
                amount: payment.amount,
                message: 'Vui lòng thanh toán qua VNPay'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo thanh toán ZaloPay
exports.createZaloPayPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user.id;

        const booking = await Booking.findByPk(bookingId, {
            include: [Service, Shop]
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking không tồn tại' });
        }

        if (booking.UserId !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền thanh toán booking này' });
        }

        const payment = await Payment.create({
            amount: booking.actual_price,
            method: 'zalopay',
            status: 'pending',
            bookingId: bookingId
        });

        // Mock ZaloPay payment URL - thay bằng tích hợp thực tế
        const mockPaymentUrl = `https://zalopay.vn/pay?amount=${booking.actual_price}&bookingId=${bookingId}&paymentId=${payment.id}`;
        
        payment.paymentUrl = mockPaymentUrl;
        await payment.save();

        res.status(201).json({ 
            status: 'success', 
            data: {
                paymentId: payment.id,
                paymentUrl: mockPaymentUrl,
                amount: payment.amount,
                message: 'Vui lòng thanh toán qua ZaloPay'
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Callback từ payment provider (MoMo/VNPay/ZaloPay)
exports.paymentCallback = async (req, res) => {
    try {
        const { paymentId, status, transactionId } = req.body;

        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment không tồn tại' });
        }

        if (status === 'success') {
            payment.status = 'paid';
            payment.transactionId = transactionId;
            payment.paidAt = new Date();
            await payment.save();

            // Cập nhật booking paymentStatus
            const booking = await Booking.findByPk(payment.bookingId);
            if (booking) {
                booking.paymentStatus = 'paid';
                await booking.save();
            }

            res.json({ status: 'success', message: 'Thanh toán thành công' });
        } else {
            payment.status = 'failed';
            await payment.save();
            res.json({ status: 'failed', message: 'Thanh toán thất bại' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xác nhận thanh toán tiền mặt (shop owner/barber)
exports.confirmCashPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment không tồn tại' });
        }

        if (payment.method !== 'cash') {
            return res.status(400).json({ message: 'Chỉ xác nhận được thanh toán tiền mặt' });
        }

        payment.status = 'paid';
        payment.paidAt = new Date();
        await payment.save();

        // Cập nhật booking
        const booking = await Booking.findByPk(payment.bookingId);
        if (booking) {
            booking.paymentStatus = 'paid';
            await booking.save();
        }

        res.json({ status: 'success', message: 'Xác nhận thanh toán tiền mặt thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thông tin payment
exports.getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [{
                model: Booking,
                include: [User, Shop, Service, Barber]
            }]
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment không tồn tại' });
        }

        res.json({ status: 'success', data: payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy payment theo booking
exports.getPaymentByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const payment = await Payment.findOne({
            where: { bookingId },
            include: [{
                model: Booking,
                include: [User, Shop, Service, Barber]
            }]
        });

        res.json({ status: 'success', data: payment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hoàn tiền
exports.refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findByPk(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment không tồn tại' });
        }

        if (payment.status !== 'paid') {
            return res.status(400).json({ message: 'Chỉ hoàn tiền được các payment đã thanh toán' });
        }

        // Mock refund - thay bằng tích hợp thực tế
        payment.status = 'refunded';
        await payment.save();

        // Cập nhật booking
        const booking = await Booking.findByPk(payment.bookingId);
        if (booking) {
            booking.paymentStatus = 'refunded';
            await booking.save();
        }

        res.json({ status: 'success', message: 'Hoàn tiền thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
