const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const userController = require('../controllers/user.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

// Public routes (need token for booking)
router.get('/my-bookings', verifyToken, bookingController.getMyBookings);
router.get('/slots', verifyToken, bookingController.getAvailableSlots);
router.post('/', verifyToken, bookingController.create);
router.patch('/:id/cancel', verifyToken, bookingController.cancelBooking);

// Review after service
router.post('/:id/review', verifyToken, userController.createReview);

// Barber/Admin routes
router.get('/barber', verifyToken, authorize(['barber', 'admin']), bookingController.getBarberAppointments);
router.patch('/:id/check-in', verifyToken, authorize(['barber', 'admin']), bookingController.checkIn);
router.patch('/:id/complete', verifyToken, authorize(['barber', 'admin']), bookingController.completeBooking);

// Admin routes
router.get('/', verifyToken, authorize(['admin']), bookingController.getAllBookings);
router.patch('/:id/status', verifyToken, authorize(['admin', 'barber']), bookingController.updateStatus);

module.exports = router;