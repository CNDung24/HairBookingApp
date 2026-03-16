// backend/src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, notificationController.create);
router.get('/', verifyToken, notificationController.getMyNotifications);
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.put('/read-all', verifyToken, notificationController.markAllAsRead);
router.delete('/:id', verifyToken, notificationController.delete);

module.exports = router;
