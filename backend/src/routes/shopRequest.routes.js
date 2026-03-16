const express = require('express');
const router = express.Router();
const shopRequestController = require('../controllers/shopRequest.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', verifyToken, shopRequestController.createShopRequest);
router.get('/my-requests', verifyToken, shopRequestController.getMyRequests);
router.get('/:id', verifyToken, shopRequestController.getShopRequestById);

module.exports = router;
