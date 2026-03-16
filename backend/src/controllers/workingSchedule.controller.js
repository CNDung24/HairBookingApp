// backend/src/controllers/workingSchedule.controller.js
const { WorkingSchedule, Barber, User, Shop } = require('../models');
const { Op } = require('sequelize');

exports.getMySchedule = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;
        
        const schedules = await WorkingSchedule.findAll({
            where: { BarberId: barberId },
            order: [
                ['specificDate', 'ASC'],
                ['dayOfWeek', 'ASC']
            ]
        });
        
        res.json({ status: 'success', data: schedules });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getScheduleByBarber = async (req, res) => {
    try {
        const { barberId } = req.params;
        
        const schedules = await WorkingSchedule.findAll({
            where: { BarberId: barberId },
            order: [
                ['specificDate', 'ASC'],
                ['dayOfWeek', 'ASC']
            ]
        });
        
        res.json({ status: 'success', data: schedules });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createSchedule = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;
        
        const { dayOfWeek, startTime, endTime, isWorking, breakStart, breakEnd, specificDate, isOff, offReason } = req.body;

        if (!dayOfWeek && !specificDate) {
            return res.status(400).json({ message: 'dayOfWeek or specificDate is required' });
        }

        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'startTime and endTime are required' });
        }

        const existing = await WorkingSchedule.findOne({
            where: {
                BarberId: barberId,
                [Op.or]: [
                    { dayOfWeek: dayOfWeek },
                    { specificDate: specificDate }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Schedule already exists for this day' });
        }

        const schedule = await WorkingSchedule.create({
            BarberId: barberId,
            dayOfWeek,
            startTime,
            endTime,
            isWorking: isWorking !== undefined ? isWorking : true,
            breakStart,
            breakEnd,
            specificDate,
            isOff: isOff || false,
            offReason
        });

        res.status(201).json({ status: 'success', data: schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSchedule = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findByPk(req.params.id);
        
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        const barberId = barberProfile ? barberProfile.id : null;
        if (schedule.BarberId !== barberId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only update your own schedule' });
        }

        const { startTime, endTime, isWorking, breakStart, breakEnd, isOff, offReason } = req.body;

        await schedule.update({
            startTime: startTime || schedule.startTime,
            endTime: endTime || schedule.endTime,
            isWorking: isWorking !== undefined ? isWorking : schedule.isWorking,
            breakStart: breakStart !== undefined ? breakStart : schedule.breakStart,
            breakEnd: breakEnd !== undefined ? breakEnd : schedule.breakEnd,
            isOff: isOff !== undefined ? isOff : schedule.isOff,
            offReason: offReason !== undefined ? offReason : schedule.offReason
        });

        res.json({ status: 'success', data: schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await WorkingSchedule.findByPk(req.params.id);
        
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        const barberId = barberProfile ? barberProfile.id : null;
        if (schedule.BarberId !== barberId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only delete your own schedule' });
        }

        await schedule.destroy();
        res.json({ status: 'success', message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.setDayOff = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;
        const { dayOfWeek, specificDate, offReason } = req.body;

        if (!dayOfWeek && !specificDate) {
            return res.status(400).json({ message: 'dayOfWeek or specificDate is required' });
        }

        const where = { BarberId: barberId };
        if (specificDate) {
            where.specificDate = specificDate;
        } else {
            where.dayOfWeek = dayOfWeek;
        }

        let schedule = await WorkingSchedule.findOne({ where });

        if (schedule) {
            schedule.isOff = true;
            schedule.offReason = offReason;
            await schedule.save();
        } else {
            schedule = await WorkingSchedule.create({
                BarberId: barberId,
                dayOfWeek,
                specificDate,
                isOff: true,
                offReason,
                startTime: '00:00',
                endTime: '00:00',
                isWorking: false
            });
        }

        res.json({ status: 'success', data: schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.setWorkingDay = async (req, res) => {
    try {
        const barberProfile = await Barber.findOne({ where: { UserId: req.user.id } });
        if (!barberProfile) return res.status(404).json({ message: 'Barber profile not found' });
        const barberId = barberProfile.id;
        const { dayOfWeek, specificDate, startTime, endTime, breakStart, breakEnd } = req.body;

        if (!dayOfWeek && !specificDate) {
            return res.status(400).json({ message: 'dayOfWeek or specificDate is required' });
        }

        const where = { BarberId: barberId };
        if (specificDate) {
            where.specificDate = specificDate;
        } else {
            where.dayOfWeek = dayOfWeek;
        }

        let schedule = await WorkingSchedule.findOne({ where });

        if (schedule) {
            schedule.isOff = false;
            schedule.startTime = startTime || schedule.startTime;
            schedule.endTime = endTime || schedule.endTime;
            schedule.breakStart = breakStart !== undefined ? breakStart : schedule.breakStart;
            schedule.breakEnd = breakEnd !== undefined ? breakEnd : schedule.breakEnd;
            await schedule.save();
        } else {
            schedule = await WorkingSchedule.create({
                BarberId: barberId,
                dayOfWeek,
                specificDate,
                startTime: startTime || '09:00',
                endTime: endTime || '18:00',
                breakStart,
                breakEnd,
                isWorking: true,
                isOff: false
            });
        }

        res.json({ status: 'success', data: schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getShopSchedules = async (req, res) => {
    try {
        const { shopId } = req.params;
        
        const barbers = await Barber.findAll({ where: { ShopId: shopId } });
        const barberIds = barbers.map(b => b.id);
        
        const schedules = await WorkingSchedule.findAll({
            where: { BarberId: barberIds },
            include: [{ model: Barber, attributes: ['id', 'name', 'avatar'] }],
            order: [
                ['BarberId', 'ASC'],
                ['specificDate', 'ASC'],
                ['dayOfWeek', 'ASC']
            ]
        });
        
        res.json({ status: 'success', data: schedules });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createScheduleForBarber = async (req, res) => {
    try {
        const { barberId, dayOfWeek, startTime, endTime, isWorking, breakStart, breakEnd, specificDate, isOff, offReason } = req.body;

        if (!barberId) {
            return res.status(400).json({ message: 'barberId is required' });
        }

        const barber = await Barber.findByPk(barberId);
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }

        if (req.user.role === 'shop_owner') {
            const user = await User.findByPk(req.user.id);
            if (user.ShopId !== barber.ShopId) {
                return res.status(403).json({ message: 'Bạn không có quyền quản lý thợ này' });
            }
        }

        if (!dayOfWeek && !specificDate) {
            return res.status(400).json({ message: 'dayOfWeek or specificDate is required' });
        }

        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'startTime and endTime are required' });
        }

        const existing = await WorkingSchedule.findOne({
            where: {
                BarberId: barberId,
                [Op.or]: [
                    { dayOfWeek: dayOfWeek },
                    { specificDate: specificDate }
                ]
            }
        });

        if (existing) {
            return res.status(400).json({ message: 'Schedule already exists for this day' });
        }

        const schedule = await WorkingSchedule.create({
            BarberId: barberId,
            dayOfWeek,
            startTime,
            endTime,
            isWorking: isWorking !== undefined ? isWorking : true,
            breakStart,
            breakEnd,
            specificDate,
            isOff: isOff || false,
            offReason
        });

        res.status(201).json({ status: 'success', data: schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, endTime, isWorking, breakStart, breakEnd, isOff, offReason } = req.body;
        
        const schedule = await WorkingSchedule.findByPk(id, {
            include: [{ model: Barber }]
        });
        
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (req.user.role === 'shop_owner') {
            const user = await User.findByPk(req.user.id);
            if (user.ShopId !== schedule.Barber.ShopId) {
                return res.status(403).json({ message: 'Bạn không có quyền' });
            }
        }

        await schedule.update({
            startTime: startTime || schedule.startTime,
            endTime: endTime || schedule.endTime,
            isWorking: isWorking !== undefined ? isWorking : schedule.isWorking,
            breakStart: breakStart !== undefined ? breakStart : schedule.breakStart,
            breakEnd: breakEnd !== undefined ? breakEnd : schedule.breakEnd,
            isOff: isOff !== undefined ? isOff : schedule.isOff,
            offReason: offReason !== undefined ? offReason : schedule.offReason
        });

        res.json({ status: 'success', data: schedule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const schedule = await WorkingSchedule.findByPk(id, {
            include: [{ model: Barber }]
        });
        
        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        if (req.user.role === 'shop_owner') {
            const user = await User.findByPk(req.user.id);
            if (user.ShopId !== schedule.Barber.ShopId) {
                return res.status(403).json({ message: 'Bạn không có quyền' });
            }
        }

        await schedule.destroy();
        res.json({ status: 'success', message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
