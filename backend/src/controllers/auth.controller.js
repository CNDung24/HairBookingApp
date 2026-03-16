const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng' });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed
        });

        res.json({ message: 'Đăng ký thành công', user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt:', { email, password, body: req.body });

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: 'Tài khoản không tồn tại' });
        }

        if (!user.isActive) {
            return res.status(400).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        user.lastLogin = new Date();
        await user.save();

        res.json({ token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Gửi email quên mật khẩu
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Không tiết lộ email có tồn tại hay không
            return res.json({ message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu' });
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Trong thực tế, gửi email chứa link reset
        // Mock: trả về link reset (trong production, gửi qua email thật)
        const resetLink = `https://hairbooking.app/reset-password?token=${resetToken}`;

        res.json({ 
            message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu',
            // Dev mode: trả về link để test
            devResetLink: resetLink
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp token và mật khẩu mới' });
        }

        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiry: { [require('sequelize').Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        // Cập nhật mật khẩu
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: 'Đặt lại mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
