const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Tất cả routes cần đăng nhập
router.use(verifyToken);

// Thanh toán tiền mặt
router.post('/cash', paymentController.createCashPayment);

// Thanh toán MoMo
router.post('/momo', paymentController.createMoMoPayment);

// Thanh toán VNPay
router.post('/vnpay', paymentController.createVNPayPayment);

// Thanh toán ZaloPay
router.post('/zalopay', paymentController.createZaloPayPayment);

// Callback từ payment provider (webhook - không cần auth)
router.post('/callback', paymentController.paymentCallback);

// Xác nhận thanh toán tiền mặt (shop owner / barber / admin)
router.patch('/:id/confirm', authorize(['shop_owner', 'barber', 'admin']), paymentController.confirmCashPayment);

// Lấy payment theo ID
router.get('/:id', paymentController.getPaymentById);

// Lấy payment theo booking
router.get('/booking/:bookingId', paymentController.getPaymentByBooking);

// Hoàn tiền (admin)
router.post('/:id/refund', authorize(['admin']), paymentController.refundPayment);

module.exports = router;
