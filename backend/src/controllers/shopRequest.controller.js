const { ShopRequest } = require('../models');

exports.createShopRequest = async (req, res) => {
    try {
        const userId = req.user.id;

        const existingRequest = await ShopRequest.findOne({
            where: {
                UserId: userId,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: 'Bạn đã có yêu cầu đang chờ duyệt' 
            });
        }

        const shopRequest = await ShopRequest.create({
            ...req.body,
            UserId: userId
        });

        res.status(201).json({
            message: 'Yêu cầu đăng ký shop đã được gửi',
            shopRequest
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await ShopRequest.findAll({
            where: { UserId: userId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShopRequestById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const request = await ShopRequest.findOne({
            where: { id, UserId: userId }
        });

        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu không tìm thấy' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
