const Banner = require('../models/Banner');

// Lấy danh sách banner (công khai - chỉ lấy banner active)
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.findAll({
            where: { isActive: true },
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách banner (admin - lấy tất cả)
exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.findAll({
            order: [['order', 'ASC'], ['createdAt', 'DESC']]
        });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm banner mới
exports.createBanner = async (req, res) => {
    try {
        const { title, image, description, isActive, order } = req.body;
        const banner = await Banner.create({
            title,
            image,
            description,
            isActive: isActive ?? true,
            order: order ?? 0
        });
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật banner
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image, description, isActive, order } = req.body;
        
        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner không tồn tại' });
        }

        await banner.update({
            title: title ?? banner.title,
            image: image ?? banner.image,
            description: description ?? banner.description,
            isActive: isActive ?? banner.isActive,
            order: order ?? banner.order
        });

        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa banner
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findByPk(id);
        
        if (!banner) {
            return res.status(404).json({ message: 'Banner không tồn tại' });
        }

        await banner.destroy();
        res.json({ message: 'Xóa banner thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
