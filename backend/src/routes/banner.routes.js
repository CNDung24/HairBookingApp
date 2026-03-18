const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Routes công khai
router.get('/banners', bannerController.getBanners);

// Routes cho admin
router.get('/admin/banners', verifyToken, isAdmin, bannerController.getAllBanners);
router.post('/admin/banners', verifyToken, isAdmin, bannerController.createBanner);
router.put('/admin/banners/:id', verifyToken, isAdmin, bannerController.updateBanner);
router.delete('/admin/banners/:id', verifyToken, isAdmin, bannerController.deleteBanner);

module.exports = router;
