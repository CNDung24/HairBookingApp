-- ============================================================================
-- INSERT DỮ LIỆU MẪU - HAIR BOOKING
-- Yêu cầu: Chạy sau khi đã tạo database từ database.sql
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ (theo thứ tự phụ thuộc)
TRUNCATE TABLE Reviews;
TRUNCATE TABLE Payments;
TRUNCATE TABLE Bookings;
TRUNCATE TABLE WorkingSchedules;
TRUNCATE TABLE Notifications;
TRUNCATE TABLE Services;
TRUNCATE TABLE Barbers;
TRUNCATE TABLE ShopRequests;
TRUNCATE TABLE Users;
TRUNCATE TABLE Shops;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. SHOPS (2 cửa hàng - do shop owner sở hữu)
-- ============================================================================
INSERT INTO Shops (id, name, address, phone, email, image, description, city, district, ward, openingTime, closingTime, rating, totalReviews, totalBookings) VALUES
(1, 'Barber House Q1', '123 Lê Lợi, P.Bến Nghé, Q.1, TP.HCM', '02838251234', 'barberhouseq1@gmail.com', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500', 'Tiệm cắt tóc nam cao cấp', 'TP.HCM', 'Quận 1', 'Bến Nghé', '09:00', '21:00', 4.8, 50, 200),
(2, 'Hanoi Style Barbershop', '56 Lý Thường Kiệt, P.Hàng Bài, Hoàn Kiếm, Hà Nội', '02438251234', 'hanoistyle@gmail.com', 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=500', 'Phong cách cổ điển châu Âu', 'Hà Nội', 'Hoàn Kiếm', 'Hàng Bài', '09:00', '20:00', 4.7, 30, 150);

-- ============================================================================
-- 2. USERS (1 admin + 2 customers + 2 shop owners)
-- Password: 123456 (hash: $2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi)
-- ============================================================================
INSERT INTO Users (id, name, email, password, phone, avatar, role, ShopId, isActive) VALUES
-- Admin
(1, 'Admin System', 'admin@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0901234567', 'https://i.pravatar.cc/150?img=1', 'admin', NULL, TRUE),
-- Customers
(2, 'Nguyễn Văn A', 'nguyenvana@gmail.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0901234568', 'https://i.pravatar.cc/150?img=3', 'customer', NULL, TRUE),
(3, 'Trần Thị B', 'tranthib@gmail.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0901234569', 'https://i.pravatar.cc/150?img=5', 'customer', NULL, TRUE),
-- Shop Owners (đã được admin duyệt shop)
(4, 'Nguyễn Văn Shop1', 'shopowner1@gmail.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0912345678', 'https://i.pravatar.cc/150?img=12', 'shop_owner', 1, TRUE),
(5, 'Nguyễn Văn Shop2', 'shopowner2@gmail.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0912345679', 'https://i.pravatar.cc/150?img=13', 'shop_owner', 2, TRUE);

-- ============================================================================
-- 3. BARBERS (8 thợ - Shop 1: 4 thợ, Shop 2: 4 thợ)
-- Lưu ý: Thợ không có tài khoản đăng nhập, do shop owner thêm vào
-- ============================================================================
INSERT INTO Barbers (id, name, avatar, phone, email, specialty, experience, bio, rating, totalReviews, totalCustomers, joinDate, ShopId, UserId) VALUES
-- Shop 1 - 4 thợ
(1, 'Trần Minh Quân', 'https://i.pravatar.cc/150?img=20', '0912345680', 'quan@shop1.com', 'Cắt tóc nam, Cắt kỹ', 5, 'Hơn 5 năm kinh nghiệm cắt tóc nam', 4.9, 50, 200, '2020-01-15', 1, NULL),
(2, 'Nguyễn Hoàng Nam', 'https://i.pravatar.cc/150?img=21', '0912345681', 'nam@shop1.com', 'Cắt tóc nam, Nhuộm tóc', 3, 'Chuyên tóc K-pop', 4.7, 30, 120, '2021-03-20', 1, NULL),
(3, 'Lê Hùng Việt', 'https://i.pravatar.cc/150?img=22', '0912345682', 'hung@shop1.com', 'Cắt tóc, Gội đầu, Massage', 7, 'Thợ chính của shop', 5.0, 80, 350, '2019-06-10', 1, NULL),
(4, 'Phạm Đình Phong', 'https://i.pravatar.cc/150?img=23', '0912345683', 'phong@shop1.com', 'Cắt tóc nam, Uốn tóc', 4, 'Phong cách hiện đại', 4.8, 45, 180, '2020-09-01', 1, NULL),
-- Shop 2 - 4 thợ
(5, 'Đỗ Quốc Trung', 'https://i.pravatar.cc/150?img=24', '0912345684', 'trung@shop2.com', 'Cắt tóc, Shave', 2, 'Nhiệt tình, vui vẻ', 4.6, 25, 100, '2022-01-10', 2, NULL),
(6, 'Nguyễn Thanh Tùng', 'https://i.pravatar.cc/150?img=25', '0912345685', 'tung@shop2.com', 'Cắt tóc nam, Nhuộm', 4, 'Phong cách trẻ trung', 4.7, 35, 140, '2021-05-15', 2, NULL),
(7, 'Trần Đình Khôi', 'https://i.pravatar.cc/150?img=26', '0912345686', 'khoi@shop2.com', 'Cắt tóc, Gội đầu', 3, 'Kinh nghiệm 3 năm', 4.5, 20, 80, '2021-08-20', 2, NULL),
(8, 'Lê Ngọc Minh', 'https://i.pravatar.cc/150?img=27', '0912345687', 'minh@shop2.com', 'Cắt tóc cao cấp', 6, 'Chuyên gia tóc nam', 4.9, 60, 250, '2020-02-01', 2, NULL);

-- ============================================================================
-- 4. SERVICES (Mỗi shop 3 dịch vụ)
-- ============================================================================
INSERT INTO Services (name, description, price, duration, category, isPopular, isActive, ShopId) VALUES
-- Shop 1
('Cắt tóc nam', 'Cắt tóc nam phong cách hiện đại', 80000, 30, 'Cắt tóc', TRUE, TRUE, 1),
('Cắt tóc + Gội đầu', 'Cắt tóc kèm gội đầu thư giãn', 100000, 45, 'Cắt tóc', TRUE, TRUE, 1),
('Nhuộm tóc nam', 'Nhuộm tóc nam chuyên nghiệp', 200000, 90, 'Nhuộm', FALSE, TRUE, 1),
-- Shop 2
('Classic Cut', 'Cắt tóc phong cách cổ điển', 100000, 35, 'Cắt tóc', TRUE, TRUE, 2),
('Hot Towel Shave', 'Cạo mặt bằng khăn nóng', 80000, 25, 'Shave', TRUE, TRUE, 2),
('Beard Trim', 'Tỉa lông mày, beard', 50000, 15, 'Shave', FALSE, TRUE, 2);

-- ============================================================================
-- 5. WORKING_SCHEDULES (Lịch làm việc cho 8 thợ)
-- ============================================================================
INSERT INTO WorkingSchedules (dayOfWeek, startTime, endTime, isWorking, breakStart, breakEnd, BarberId) VALUES
-- Barber 1 (Shop 1)
('monday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('tuesday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('wednesday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('thursday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 1),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 1),
('sunday', '09:00', '18:00', FALSE, NULL, NULL, 1),

-- Barber 2 (Shop 1)
('monday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('tuesday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('wednesday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('thursday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('friday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 2),
('sunday', '10:00', '18:00', TRUE, '13:00', '14:00', 2),

-- Barber 3 (Shop 1)
('monday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('tuesday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('wednesday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('thursday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('friday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('saturday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('sunday', '08:00', '18:00', TRUE, '12:00', '13:00', 3),

-- Barber 4 (Shop 1)
('monday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('tuesday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('wednesday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('thursday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('friday', '09:00', '20:00', TRUE, '12:00', '13:00', 4),
('saturday', '09:00', '20:00', TRUE, '12:00', '13:00', 4),
('sunday', '09:00', '17:00', TRUE, '12:00', '13:00', 4),

-- Barber 5 (Shop 2)
('monday', '09:00', '18:00', TRUE, '12:00', '13:00', 5),
('tuesday', '09:00', '18:00', TRUE, '12:00', '13:00', 5),
('wednesday', '09:00', '18:00', TRUE, '12:00', '13:00', 5),
('thursday', '09:00', '18:00', TRUE, '12:00', '13:00', 5),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 5),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 5),
('sunday', '09:00', '18:00', FALSE, NULL, NULL, 5),

-- Barber 6 (Shop 2)
('monday', '10:00', '20:00', TRUE, '13:00', '14:00', 6),
('tuesday', '10:00', '20:00', TRUE, '13:00', '14:00', 6),
('wednesday', '10:00', '20:00', TRUE, '13:00', '14:00', 6),
('thursday', '10:00', '20:00', TRUE, '13:00', '14:00', 6),
('friday', '10:00', '20:00', TRUE, '13:00', '14:00', 6),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 6),
('sunday', '10:00', '18:00', TRUE, '13:00', '14:00', 6),

-- Barber 7 (Shop 2)
('monday', '09:00', '19:00', TRUE, '12:00', '13:00', 7),
('tuesday', '09:00', '19:00', TRUE, '12:00', '13:00', 7),
('wednesday', '09:00', '19:00', TRUE, '12:00', '13:00', 7),
('thursday', '09:00', '19:00', TRUE, '12:00', '13:00', 7),
('friday', '09:00', '20:00', TRUE, '12:00', '13:00', 7),
('saturday', '09:00', '20:00', TRUE, '12:00', '13:00', 7),
('sunday', '09:00', '17:00', TRUE, '12:00', '13:00', 7),

-- Barber 8 (Shop 2)
('monday', '08:00', '21:00', TRUE, '12:00', '13:00', 8),
('tuesday', '08:00', '21:00', TRUE, '12:00', '13:00', 8),
('wednesday', '08:00', '21:00', TRUE, '12:00', '13:00', 8),
('thursday', '08:00', '21:00', TRUE, '12:00', '13:00', 8),
('friday', '08:00', '21:00', TRUE, '12:00', '13:00', 8),
('saturday', '08:00', '21:00', TRUE, '12:00', '13:00', 8),
('sunday', '08:00', '18:00', TRUE, '12:00', '13:00', 8);

-- ============================================================================
-- DONE!
-- ============================================================================
