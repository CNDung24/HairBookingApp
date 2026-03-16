const { Shop, Barber, Service, Review } = require('../models');
const { Op } = require('sequelize');

exports.getAllShops = async (req, res) => {
    try {
        const shops = await Shop.findAll({
            include: [
                { model: Barber },
                { model: Service }
            ]
        });
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchShops = async (req, res) => {
    try {
        const { q, city, service } = req.query;
        const where = {};

        if (q) {
            where.name = { [Op.like]: `%${q}%` };
        }
        if (city) {
            where.address = { [Op.like]: `%${city}%` };
        }

        const shops = await Shop.findAll({
            where,
            include: [
                { model: Barber },
                { model: Service }
            ]
        });
        res.json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShopById = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id, {
            include: [
                { model: Barber },
                { model: Service }
            ]
        });
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShopReviews = async (req, res) => {
    try {
        const shopId = req.params.id;
        
        const barbers = await Barber.findAll({ where: { ShopId: shopId } });
        const barberIds = barbers.map(b => b.id);

        const reviews = await Review.findAll({
            where: { BarberId: barberIds },
            include: ['User'],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 'success', data: reviews });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// shop.controller.js
exports.getServicesByShop = async (req, res) => {
    const services = await Service.findAll({ where: { ShopId: req.params.id } });
    res.json({ status: 'success', data: services });
};

exports.getBarbersByShop = async (req, res) => {
    const barbers = await Barber.findAll({ where: { ShopId: req.params.id } });
    res.json({ status: 'success', data: barbers });
};

exports.createShop = async (req, res) => {
    try {
        const shop = await Shop.create(req.body);
        res.status(201).json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateShop = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        
        await shop.update(req.body);
        res.json(shop);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.params.id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });
        
        await shop.destroy();
        res.json({ message: 'Shop deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};