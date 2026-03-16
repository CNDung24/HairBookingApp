// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Hàm kiểm tra role
exports.authorize = (roles = [], allowOwnData = false) => {
    return (req, res, next) => {
        const user = req.user;

        // 1. Super Admin luôn có quyền
        if (user.role === 'admin') return next();

        // 2. Kiểm tra role cơ bản
        if (roles.length && !roles.includes(user.role)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }

        // 3. Store Manager: Kiểm tra xem có thao tác đúng store_id của mình không
        if (user.role === 'manager' && req.body.store_id) {
            if (user.ShopId !== parseInt(req.body.store_id)) {
                return res.status(403).json({ message: 'Bạn không quản lý chi nhánh này' });
            }
        }

        next();
    };
};