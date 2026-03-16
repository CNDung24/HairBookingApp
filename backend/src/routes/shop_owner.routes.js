const express = require('express');
const router = express.Router();
const shopOwnerController = require('../controllers/shop_owner.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Tất cả routes cần đăng nhập và là shop_owner
router.use(verifyToken);
router.use(authorize(['shop_owner']));

// Shop
router.get('/shop', shopOwnerController.getMyShop);
router.put('/shop', shopOwnerController.updateMyShop);

// Dịch vụ
router.get('/services', shopOwnerController.getMyServices);
router.post('/services', shopOwnerController.createService);
router.put('/services/:id', shopOwnerController.updateService);
router.delete('/services/:id', shopOwnerController.deleteService);

// Thợ
router.get('/barbers', shopOwnerController.getMyBarbers);
router.post('/barbers', shopOwnerController.createBarber);
router.put('/barbers/:id', shopOwnerController.updateBarber);
router.delete('/barbers/:id', shopOwnerController.deleteBarber);

// Bookings
router.get('/bookings', shopOwnerController.getMyShopBookings);
router.patch('/bookings/:id/status', shopOwnerController.updateBookingStatus);

// Reviews
router.get('/reviews', shopOwnerController.getMyShopReviews);
router.post('/reviews/:id/reply', shopOwnerController.replyReview);

// Stats
router.get('/stats', shopOwnerController.getMyShopStats);

module.exports = router;
