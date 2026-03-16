// backend/src/routes/review.routes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, reviewController.create);
router.get('/my-reviews', verifyToken, reviewController.getMyReviews);
router.get('/barber/:barberId', reviewController.getByBarber);
router.get('/shop/:shopId', reviewController.getByShop);
router.delete('/:id', verifyToken, reviewController.delete);

module.exports = router;
