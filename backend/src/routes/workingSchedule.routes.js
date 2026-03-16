const express = require('express');
const router = express.Router();
const workingScheduleController = require('../controllers/workingSchedule.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.get('/my', verifyToken, authorize(['barber']), workingScheduleController.getMySchedule);
router.get('/barber/:barberId', verifyToken, workingScheduleController.getScheduleByBarber);
router.post('/', verifyToken, authorize(['barber']), workingScheduleController.createSchedule);
router.put('/:id', verifyToken, authorize(['barber', 'admin']), workingScheduleController.updateSchedule);
router.delete('/:id', verifyToken, authorize(['barber', 'admin']), workingScheduleController.deleteSchedule);
router.post('/day-off', verifyToken, authorize(['barber']), workingScheduleController.setDayOff);
router.post('/working-day', verifyToken, authorize(['barber']), workingScheduleController.setWorkingDay);

router.get('/shop/:shopId', verifyToken, authorize(['shop_owner', 'admin']), workingScheduleController.getShopSchedules);
router.post('/barber', verifyToken, authorize(['shop_owner', 'admin']), workingScheduleController.createScheduleForBarber);
router.put('/schedule/:id', verifyToken, authorize(['shop_owner', 'admin']), workingScheduleController.updateScheduleById);
router.delete('/schedule/:id', verifyToken, authorize(['shop_owner', 'admin']), workingScheduleController.deleteScheduleById);

module.exports = router;
