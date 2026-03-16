const express = require('express');
const router = express.Router();
const barberController = require('../controllers/barber.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.get('/schedule', verifyToken, authorize(['barber']), barberController.getMySchedule);
router.put('/bookings/:id/status', verifyToken, authorize(['barber']), barberController.updateBookingStatus);
router.get('/income', verifyToken, authorize(['barber']), barberController.getIncome);
router.get('/income/weekly', verifyToken, authorize(['barber']), barberController.getWeeklyIncome);
router.get('/income/monthly', verifyToken, authorize(['barber']), barberController.getMonthlyIncome);

module.exports = router;
