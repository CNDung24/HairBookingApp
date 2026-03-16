const express = require('express');
const router = express.Router();
const controller = require('../controllers/shop.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.get('/', controller.getAllShops);
router.get('/search', controller.searchShops);
router.get('/:id', controller.getShopById);
router.get('/:id/services', controller.getServicesByShop);
router.get('/:id/barbers', controller.getBarbersByShop);
router.get('/:id/reviews', controller.getShopReviews);
// Admin routes
router.post('/', verifyToken, authorize(['admin']), controller.createShop);
router.put('/:id', verifyToken, authorize(['admin']), controller.updateShop);
router.delete('/:id', verifyToken, authorize(['admin']), controller.deleteShop);

module.exports = router;