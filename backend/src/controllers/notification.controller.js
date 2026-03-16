// backend/src/controllers/notification.controller.js
const { Notification, User, Booking, Shop, Barber, Service } = require('../models');

exports.create = async (req, res) => {
    try {
        const { userId, title, content, type, referenceId, referenceType } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        const notification = await Notification.create({
            title,
            content,
            type: type || 'general',
            referenceId,
            referenceType,
            UserId: userId,
            isRead: false
        });

        res.status(201).json({ status: 'success', data: notification });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json({ status: 'success', data: notifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.count({
            where: { UserId: req.user.id, isRead: false }
        });

        res.json({ status: 'success', data: { count } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification không tồn tại' });
        }

        if (notification.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền' });
        }

        notification.isRead = true;
        await notification.save();

        res.json({ status: 'success', data: notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.update(
            { isRead: true },
            { where: { UserId: req.user.id, isRead: false } }
        );

        res.json({ status: 'success', message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findByPk(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification không tồn tại' });
        }

        if (notification.UserId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền' });
        }

        await notification.destroy();

        res.json({ status: 'success', message: 'Xóa notification thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendBookingNotification = async (bookingId, type) => {
    try {
        console.log(`[NOTIFICATION] Sending notification for booking ${bookingId}, type: ${type}`);

        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: User, as: 'User' },
                { model: Shop },
                { model: Barber },
                { model: Service }
            ]
        });

        if (!booking) {
            console.log(`[NOTIFICATION] Booking ${bookingId} not found`);
            return;
        }

        console.log(`[NOTIFICATION] Booking found - ShopId: ${booking.ShopId}, BarberId: ${booking.BarberId}, Barber.UserId: ${booking.Barber?.UserId}`);

        let title, content;
        
        switch (type) {
            case 'created':
                title = 'Đặt lịch thành công';
                content = `Bạn đã đặt lịch ${booking.Service?.name || 'dịch vụ'} tại ${booking.Shop?.name} vào ngày ${booking.booking_date} lúc ${booking.booking_time}`;
                break;
            case 'confirmed':
                title = 'Lịch hẹn đã được xác nhận';
                content = `Lịch hẹn của bạn tại ${booking.Shop?.name} đã được xác nhận`;
                break;
            case 'cancelled':
                title = 'Lịch hẹn đã bị hủy';
                content = `Lịch hẹn của bạn tại ${booking.Shop?.name} vào ngày ${booking.booking_date} đã bị hủy`;
                break;
            case 'reminder':
                title = 'Nhắc nhở lịch hẹn';
                content = `Ngày mai bạn có lịch hẹn tại ${booking.Shop?.name} lúc ${booking.booking_time}`;
                break;
            case 'completed':
                title = 'Dịch vụ đã hoàn thành';
                content = `Cảm ơn bạn đã sử dụng dịch vụ tại ${booking.Shop?.name}. Hãy để lại đánh giá nhé!`;
                break;
            default:
                return;
        }

        // Gửi thông báo cho customer
        console.log(`[NOTIFICATION] Creating notification for customer: ${booking.UserId}`);
        await Notification.create({
            title,
            message: content,
            type: 'booking',
            referenceId: bookingId,
            referenceType: 'booking',
            UserId: booking.UserId,
            isRead: false
        });

        // Gửi thông báo cho shop owner
        const shopOwner = await User.findOne({
            where: { ShopId: booking.ShopId, role: 'shop_owner' }
        });
        
        console.log(`[NOTIFICATION] Shop owner found:`, shopOwner ? shopOwner.id : 'null');

        if (shopOwner) {
            let ownerTitle, ownerContent;
            
            switch (type) {
                case 'created':
                    ownerTitle = 'Có lịch hẹn mới';
                    ownerContent = `Khách ${booking.User?.name || 'Ẩn danh'} đặt lịch ${booking.Service?.name} vào ngày ${booking.booking_date} lúc ${booking.booking_time}`;
                    break;
                case 'confirmed':
                    ownerTitle = 'Lịch hẹn đã xác nhận';
                    ownerContent = `Lịch hẹn của khách ${booking.User?.name} đã được xác nhận`;
                    break;
                case 'cancelled':
                    ownerTitle = 'Lịch hẹn bị hủy';
                    ownerContent = `Khách ${booking.User?.name} đã hủy lịch hẹn vào ngày ${booking.booking_date}`;
                    break;
                case 'completed':
                    ownerTitle = 'Dịch vụ hoàn thành';
                    ownerContent = `Đã hoàn thành dịch vụ ${booking.Service?.name} cho khách ${booking.User?.name}`;
                    break;
                default:
                    ownerTitle = title;
                    ownerContent = content;
            }

            if (ownerTitle && ownerContent && shopOwner.id !== booking.UserId) {
                console.log(`[NOTIFICATION] Creating notification for shop owner: ${shopOwner.id}`);
                await Notification.create({
                    title: ownerTitle,
                    message: ownerContent,
                    type: 'booking',
                    referenceId: bookingId,
                    referenceType: 'booking',
                    UserId: shopOwner.id,
                    isRead: false
                });
            }
        }

        // Gửi thông báo cho barber - tìm user có BarberProfileId = Barber.id
        if (booking.BarberId) {
            // Cách 1: Tìm qua BarberProfileId
            let barberUser = null;
            
            if (booking.Barber?.UserId) {
                barberUser = await User.findByPk(booking.Barber.UserId);
            } else {
                // Cách 2: Tìm user có BarberProfileId = Barber.id
                barberUser = await User.findOne({
                    where: { BarberProfileId: booking.BarberId }
                });
            }
            
            // Cách 3: Tìm tất cả user thuộc shop và có role barber
            if (!barberUser) {
                const shopStaffs = await User.findAll({
                    where: { ShopId: booking.ShopId, role: 'barber' }
                });
                if (shopStaffs.length > 0) {
                    barberUser = shopStaffs[0];
                }
            }

            console.log(`[NOTIFICATION] Barber user found:`, barberUser ? barberUser.id : 'null');

            if (barberUser) {
                let barberTitle, barberContent;
                
                switch (type) {
                    case 'created':
                        barberTitle = 'Có lịch hẹn mới';
                        barberContent = `Khách ${booking.User?.name || 'Ẩn danh'} đặt lịch ${booking.Service?.name} vào ngày ${booking.booking_date} lúc ${booking.booking_time}`;
                        break;
                    case 'confirmed':
                        barberTitle = 'Lịch hẹn đã xác nhận';
                        barberContent = `Lịch hẹn với khách ${booking.User?.name} đã được xác nhận - chuẩn bị đón khách`;
                        break;
                    case 'cancelled':
                        barberTitle = 'Lịch hẹn bị hủy';
                        barberContent = `Khách ${booking.User?.name} đã hủy lịch hẹn vào ngày ${booking.booking_date}`;
                        break;
                    case 'completed':
                        barberTitle = 'Dịch vụ hoàn thành';
                        barberContent = `Đã hoàn thành dịch vụ ${booking.Service?.name} cho khách ${booking.User?.name}`;
                        break;
                    default:
                        barberTitle = title;
                        barberContent = content;
                }

                if (barberTitle && barberContent && barberUser.id !== booking.UserId) {
                    console.log(`[NOTIFICATION] Creating notification for barber: ${barberUser.id}`);
                    await Notification.create({
                        title: barberTitle,
                        message: barberContent,
                        type: 'booking',
                        referenceId: bookingId,
                        referenceType: 'booking',
                        UserId: barberUser.id,
                        isRead: false
                    });
                }
            }
        }

        console.log(`[NOTIFICATION] Done for booking ${bookingId}`);

    } catch (error) {
        console.error('Send booking notification error:', error);
    }
};
