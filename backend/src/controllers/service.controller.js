const { Service, Shop, Barber } = require('../models');

exports.getAllServices = async (req, res) => {
    try {
        const { shopId } = req.query;
        const where = {};
        if (shopId) where.ShopId = shopId;

        const services = await Service.findAll({
            where,
            include: [{ model: Shop, attributes: ['name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', data: services });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id, {
            include: [{ model: Shop, attributes: ['name'] }]
        });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ status: 'success', data: service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createService = async (req, res) => {
    try {
        const {
            name, description, price, duration, image,
            category, isActive, isPopular, discountPrice,
            discountEndDate, ShopId
        } = req.body;

        if (!name || !price || !duration) {
            return res.status(400).json({ message: 'Name, price, and duration are required' });
        }

        if (!ShopId) {
            return res.status(400).json({ message: 'ShopId is required' });
        }

        const service = await Service.create({
            name,
            description,
            price,
            duration,
            image,
            category,
            isActive: isActive !== undefined ? isActive : true,
            isPopular: isPopular || false,
            discountPrice,
            discountEndDate,
            ShopId
        });

        res.status(201).json({ status: 'success', data: service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const {
            name, description, price, duration, image,
            category, isActive, isPopular, discountPrice,
            discountEndDate
        } = req.body;

        await service.update({
            name: name || service.name,
            description: description !== undefined ? description : service.description,
            price: price || service.price,
            duration: duration || service.duration,
            image: image !== undefined ? image : service.image,
            category: category !== undefined ? category : service.category,
            isActive: isActive !== undefined ? isActive : service.isActive,
            isPopular: isPopular !== undefined ? isPopular : service.isPopular,
            discountPrice: discountPrice !== undefined ? discountPrice : service.discountPrice,
            discountEndDate: discountEndDate !== undefined ? discountEndDate : service.discountEndDate
        });

        res.json({ status: 'success', data: service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        await service.destroy();
        res.json({ status: 'success', message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleServiceStatus = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        service.isActive = !service.isActive;
        await service.save();

        res.json({ status: 'success', data: service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.setPopularService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        service.isPopular = !service.isPopular;
        await service.save();

        res.json({ status: 'success', data: service });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
