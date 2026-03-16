const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { verifyToken, authorize } = require('../middleware/auth.middleware');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', verifyToken, authorize(['admin']), serviceController.createService);
router.put('/:id', verifyToken, authorize(['admin']), serviceController.updateService);
router.delete('/:id', verifyToken, authorize(['admin']), serviceController.deleteService);
router.patch('/:id/toggle', verifyToken, authorize(['admin']), serviceController.toggleServiceStatus);
router.patch('/:id/popular', verifyToken, authorize(['admin']), serviceController.setPopularService);

module.exports = router;
