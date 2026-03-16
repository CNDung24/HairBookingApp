// backend/seed.js
const { sequelize, Shop, Barber, Service, User, WorkingSchedule } = require('./src/models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('🔄 Đang kết nối database...');
        await sequelize.sync({ force: false });

        // Kiểm tra nếu đã có dữ liệu thì bỏ qua
        const existingUsers = await User.count();
        if (existingUsers > 0) {
            console.log('⚠️ Database đã có dữ liệu, bỏ qua seeding!');
            console.log('Nếu muốn reset dữ liệu, hãy xóa database thủ công và chạy lại seed.');
            process.exit();
        }

        const passwordHashed = await bcrypt.hash('123456', 10);

        // 1. TẠO ADMIN
        console.log('👤 Đang tạo tài khoản Admin...');
        await User.create({
            name: 'Hệ Thống Admin',
            email: 'admin@gmail.com',
            password: passwordHashed,
            role: 'admin',
            phone: '0999999999'
        });

        // 2. TẠO KHÁCH HÀNG (CUSTOMERS)
        console.log('👥 Đang tạo tài khoản Khách hàng...');
        const customers = [
            { name: 'Nguyễn Văn A', email: 'khach1@gmail.com' },
            { name: 'Trần Thị B', email: 'khach2@gmail.com' },
            { name: 'Lê Văn C', email: 'khach3@gmail.com' },
        ];
        for (let c of customers) {
            await User.create({
                ...c,
                password: passwordHashed,
                role: 'customer',
                phone: '0123456789',
                avatar: `https://i.pravatar.cc/150?u=${c.email}`
            });
        }

        // 3. TẠO SHOPS
        console.log('🏠 Đang tạo Shop...');
        const shop1 = await Shop.create({
            name: 'Gentlemen Premium Cut',
            address: '123 Wall Street, New York',
            image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800'
        });

        const shop2 = await Shop.create({
            name: 'Luxury Hair Salon',
            address: '456 Broadway, New York',
            image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800'
        });

        // 4. TẠO DỊCH VỤ (SERVICES)
        console.log('✂️  Đang tạo Dịch vụ cho các Shop...');
        const services = [
            { name: 'Classic Cut', price: 150000, duration: 30, ShopId: shop1.id },
            { name: 'Combo 7 Bước', price: 250000, duration: 60, ShopId: shop1.id },
            { name: 'Uốn Hàn Quốc', price: 500000, duration: 120, ShopId: shop1.id },
            { name: 'Cắt tóc Nữ', price: 200000, duration: 45, ShopId: shop2.id },
            { name: 'Nhuộm màu thời trang', price: 800000, duration: 150, ShopId: shop2.id },
        ];
        await Service.bulkCreate(services);

        // 5. TẠO 10 BARBERS (Vừa tạo User, vừa tạo Barber Profile)
        console.log('👨‍🎨 Đang tạo 10 Barber...');
        const barberNames = [
            'John Wick', 'Harvey Specter', 'Thomas Shelby', 'Tony Stark', 'Bruce Wayne',
            'James Bond', 'Sherlock Holmes', 'Peter Parker', 'Steve Rogers', 'Danny Ocean'
        ];

        for (let i = 0; i < barberNames.length; i++) {
            const email = `barber${i + 1}@gmail.com`;
            const name = barberNames[i];

            // Chia 5 thợ đầu cho shop 1, 5 thợ sau cho shop 2
            const assignedShopId = i < 5 ? shop1.id : shop2.id;
            const avatarUrl = `https://randomuser.me/api/portraits/men/${30 + i}.jpg`;

            // Tạo bản ghi trong bảng Barbers (Để hiển thị trong Shop)
            const barberProfile = await Barber.create({
                name: name,
                avatar: avatarUrl,
                ShopId: assignedShopId
            });

            // Tạo bản ghi trong bảng Users (Để thợ có thể đăng nhập)
            await User.create({
                name: name,
                email: email,
                password: passwordHashed,
                role: 'barber',
                phone: '090000000' + i,
                avatar: avatarUrl,
                BarberProfileId: barberProfile.id // Link tài khoản user với thợ
            });

            // TẠO LỊCH LÀM VIỆC MẶC ĐỊNH CHO THỢ (Thứ 2 - Thứ 7)
            const defaultSchedule = [
                { dayOfWeek: 'monday', startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
                { dayOfWeek: 'tuesday', startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
                { dayOfWeek: 'wednesday', startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
                { dayOfWeek: 'thursday', startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
                { dayOfWeek: 'friday', startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
                { dayOfWeek: 'saturday', startTime: '09:00', endTime: '18:00', breakStart: '12:00', breakEnd: '13:00' },
            ];

            for (const schedule of defaultSchedule) {
                await WorkingSchedule.create({
                    ...schedule,
                    BarberId: barberProfile.id,
                    isWorking: true,
                    isOff: false
                });
            }
        }

        console.log(`
✅ SEEDING HOÀN TẤT!
---------------------------------------
Tài khoản Admin: admin@gmail.com / 123456
Tài khoản Khách: khach1@gmail.com / 123456
Tài khoản Thợ:   barber1@gmail.com -> barber10@gmail.com / 123456
---------------------------------------
        `);
        process.exit();

    } catch (e) {
        console.error('\n❌ LỖI KHI SEED DỮ LIỆU:');
        console.error(e);
        process.exit(1);
    }
};

seed();