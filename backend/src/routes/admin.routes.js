const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.get('/stats', verifyToken, authorize(['admin']), adminController.getDashboardStats);
router.get('/users', verifyToken, authorize(['admin']), adminController.getAllUsers);
router.get('/shops', verifyToken, authorize(['admin']), adminController.getAllShops);
router.get('/barbers', verifyToken, authorize(['admin']), adminController.getAllBarbers);
router.get('/bookings', verifyToken, authorize(['admin']), adminController.getAllBookings);

router.post('/shops', verifyToken, authorize(['admin']), adminController.createShop);

router.put('/users/:id', verifyToken, authorize(['admin']), adminController.updateUser);
router.delete('/users/:id', verifyToken, authorize(['admin']), adminController.deleteUser);

router.patch('/bookings/:id', verifyToken, authorize(['admin']), adminController.updateBookingStatus);

// Shop Requests
router.get('/shop-requests', verifyToken, authorize(['admin']), adminController.getAllShopRequests);
router.get('/shop-requests/:id', verifyToken, authorize(['admin']), adminController.getShopRequestById);
router.patch('/shop-requests/:id/approve', verifyToken, authorize(['admin']), adminController.approveShopRequest);
router.patch('/shop-requests/:id/reject', verifyToken, authorize(['admin']), adminController.rejectShopRequest);

module.exports = router;
