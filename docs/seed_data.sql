-- ============================================================================
-- SEED DATA - HAIR BOOKING
-- Yêu cầu: 1 admin, 5 shop, 10 customer, mỗi shop 5 barber
-- Password: 123456 (hash)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

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
-- 1. SHOPS (5 cửa hàng)
-- ============================================================================
INSERT INTO Shops (id, name, address, phone, email, image, description, city, district, ward, openingTime, closingTime, rating, totalReviews, totalBookings) VALUES
(1, 'Barber House Q1', '123 Lê Lợi, P.Bến Nghé, Q.1, TP.HCM', '02838251234', 'barberhouseq1@gmail.com', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500', 'Tiệm cắt tóc nam cao cấp', 'TP.HCM', 'Quận 1', 'Bến Nghé', '09:00', '21:00', 4.8, 50, 200),
(2, 'Hanoi Style Barbershop', '56 Lý Thường Kiệt, P.Hàng Bài, Hoàn Kiếm, Hà Nội', '02438251234', 'hanoistyle@gmail.com', 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=500', 'Phong cách cổ điển châu Âu', 'Hà Nội', 'Hoàn Kiếm', 'Hàng Bài', '09:00', '20:00', 4.7, 30, 150),
(3, 'Sài Gòn Barber Studio', '88 Nguyễn Trãi, P.Bến Thành, Q.1, TP.HCM', '02838255678', 'sgbarberstudio@gmail.com', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=500', 'Studio tóc nam hiện đại', 'TP.HCM', 'Quận 1', 'Bến Thành', '10:00', '22:00', 4.9, 80, 350),
(4, 'Hà Nội Gents Salon', '45 Hoàng Diệu, P.Điện Biên, Ba Đình, Hà Nội', '02438235567', 'hanoigents@gmail.com', 'https://images.unsplash.com/photo-1503951914875-452162b028f6?w=500', 'Salon tóc nam sang trọng', 'Hà Nội', 'Ba Đình', 'Điện Biên', '09:00', '20:00', 4.6, 25, 120),
(5, 'Đà Nẵng Style Barber', '123 Lê Duẩn, P.Hải Châu 1, Đà Nẵng', '02363885555', 'danangstyle@gmail.com', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500', 'Phong cách hiện đại', 'Đà Nẵng', 'Hải Châu', 'Hải Châu 1', '09:00', '21:00', 4.7, 40, 180);

-- ============================================================================
-- 2. USERS 
-- Password: 123456 (hash: $2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi)
-- ============================================================================
INSERT INTO Users (id, name, email, password, phone, avatar, role, ShopId, isActive) VALUES
-- Admin
(1, 'Admin System', 'admin@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0901234567', 'https://i.pravatar.cc/150?img=1', 'admin', NULL, TRUE),

-- Shop Owners (5 người - mỗi người sở hữu 1 shop)
(2, 'Nguyễn Văn Minh', 'owner1@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0912345678', 'https://i.pravatar.cc/150?img=11', 'shop_owner', 1, TRUE),
(3, 'Trần Văn Hùng', 'owner2@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0912345679', 'https://i.pravatar.cc/150?img=12', 'shop_owner', 2, TRUE),
(4, 'Lê Văn Phong', 'owner3@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0912345680', 'https://i.pravatar.cc/150?img=13', 'shop_owner', 3, TRUE),
(5, 'Phạm Văn Đức', 'owner4@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0912345681', 'https://i.pravatar.cc/150?img=14', 'shop_owner', 4, TRUE),
(6, 'Hoàng Văn Nam', 'owner5@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0912345682', 'https://i.pravatar.cc/150?img=15', 'shop_owner', 5, TRUE),

-- Customers (10 người)
(7, 'Nguyễn Thị Lan', 'customer1@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0901111222', 'https://i.pravatar.cc/150?img=20', 'customer', NULL, TRUE),
(8, 'Trần Văn A', 'customer2@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0902222333', 'https://i.pravatar.cc/150?img=21', 'customer', NULL, TRUE),
(9, 'Lê Thị Hương', 'customer3@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0903333444', 'https://i.pravatar.cc/150?img=22', 'customer', NULL, TRUE),
(10, 'Phạm Văn B', 'customer4@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0904444555', 'https://i.pravatar.cc/150?img=23', 'customer', NULL, TRUE),
(11, 'Nguyễn Thị Mai', 'customer5@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0905555666', 'https://i.pravatar.cc/150?img=24', 'customer', NULL, TRUE),
(12, 'Trần Văn C', 'customer6@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0906666777', 'https://i.pravatar.cc/150?img=25', 'customer', NULL, TRUE),
(13, 'Lê Văn D', 'customer7@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0907777888', 'https://i.pravatar.cc/150?img=26', 'customer', NULL, TRUE),
(14, 'Phạm Thị Yến', 'customer8@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0908888999', 'https://i.pravatar.cc/150?img=27', 'customer', NULL, TRUE),
(15, 'Nguyễn Văn E', 'customer9@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0909999000', 'https://i.pravatar.cc/150?img=28', 'customer', NULL, TRUE),
(16, 'Trần Thị Xanh', 'customer10@hairbooking.com', '$2b$10$DaZ4rsLbKfF5t4d9qGt4CuBf3L1Cpu62bj4QPmJsbWfJ7L9K62dTi', '0910000111', 'https://i.pravatar.cc/150?img=29', 'customer', NULL, TRUE);

-- ============================================================================
-- 3. BARBERS (25 thợ - 5 shop x 5 thợ)
-- ============================================================================
INSERT INTO Barbers (id, name, avatar, phone, email, specialty, experience, bio, rating, totalReviews, totalCustomers, joinDate, ShopId, UserId) VALUES
-- Shop 1 - 5 thợ
(1, 'Trần Minh Quân', 'https://i.pravatar.cc/150?img=30', '0981111111', 'quan@shop1.com', 'Cắt tóc nam, Cắt kỹ', 5, 'Hơn 5 năm kinh nghiệm cắt tóc nam', 4.9, 50, 200, '2020-01-15', 1, NULL),
(2, 'Nguyễn Hoàng Nam', 'https://i.pravatar.cc/150?img=31', '0982222222', 'nam@shop1.com', 'Cắt tóc nam, Nhuộm tóc', 3, 'Chuyên tóc K-pop', 4.7, 30, 120, '2021-03-20', 1, NULL),
(3, 'Lê Hùng Việt', 'https://i.pravatar.cc/150?img=32', '0983333333', 'hung@shop1.com', 'Cắt tóc, Gội đầu, Massage', 7, 'Thợ chính của shop', 5.0, 80, 350, '2019-06-10', 1, NULL),
(4, 'Phạm Đình Phong', 'https://i.pravatar.cc/150?img=33', '0984444444', 'phong@shop1.com', 'Cắt tóc nam, Uốn tóc', 4, 'Phong cách hiện đại', 4.8, 45, 180, '2020-09-01', 1, NULL),
(5, 'Đỗ Minh Tuấn', 'https://i.pravatar.cc/150?img=34', '0985555555', 'tuan@shop1.com', 'Cắt tóc, Shave', 2, 'Nhiệt tình, vui vẻ', 4.6, 25, 100, '2022-01-10', 1, NULL),

-- Shop 2 - 5 thợ
(6, 'Đỗ Quốc Trung', 'https://i.pravatar.cc/150?img=35', '0986666666', 'trung@shop2.com', 'Cắt tóc, Shave', 6, 'Nhiều năm kinh nghiệm', 4.8, 55, 220, '2019-05-15', 2, NULL),
(7, 'Nguyễn Thanh Tùng', 'https://i.pravatar.cc/150?img=36', '0987777777', 'tung@shop2.com', 'Cắt tóc nam, Nhuộm', 4, 'Phong cách trẻ trung', 4.7, 35, 140, '2021-05-15', 2, NULL),
(8, 'Trần Đình Khôi', 'https://i.pravatar.cc/150?img=37', '0988888888', 'khoi@shop2.com', 'Cắt tóc, Gội đầu', 3, 'Kinh nghiệm 3 năm', 4.5, 20, 80, '2021-08-20', 2, NULL),
(9, 'Lê Ngọc Minh', 'https://i.pravatar.cc/150?img=38', '0989999999', 'minh@shop2.com', 'Cắt tóc cao cấp', 6, 'Chuyên gia tóc nam', 4.9, 60, 250, '2020-02-01', 2, NULL),
(10, 'Vũ Văn Hải', 'https://i.pravatar.cc/150?img=39', '0971111111', 'hai@shop2.com', 'Cắt tóc, Beard Trim', 3, 'Nhiệt tình, chu đáo', 4.6, 28, 110, '2021-11-01', 2, NULL),

-- Shop 3 - 5 thợ
(11, 'Nguyễn Văn Đức', 'https://i.pravatar.cc/150?img=40', '0972222222', 'duc@shop3.com', 'Cắt tóc nam cao cấp', 8, 'Top thợ của Sài Gòn', 5.0, 100, 450, '2018-01-01', 3, NULL),
(12, 'Trần Văn Khoa', 'https://i.pravatar.cc/150?img=41', '0973333333', 'khoa@shop3.com', 'Cắt tóc, Nhuộm tóc', 5, 'Phong cách Hàn Quốc', 4.8, 65, 280, '2020-03-15', 3, NULL),
(13, 'Lê Thanh Sơn', 'https://i.pravatar.cc/150?img=42', '0974444444', 'son@shop3.com', 'Cắt tóc, Uốn tóc', 4, 'Sáng tạo, nhiệt tình', 4.7, 40, 160, '2020-07-01', 3, NULL),
(14, 'Phạm Văn Linh', 'https://i.pravatar.cc/150?img=43', '0975555555', 'linh@shop3.com', 'Cắt tóc, Gội đầu', 3, 'Mới gia nhập nhưng năng động', 4.5, 22, 90, '2022-06-01', 3, NULL),
(15, 'Nguyễn Hùng Dũng', 'https://i.pravatar.cc/150?img=44', '0976666666', 'dung@shop3.com', 'Cắt tóc, Shave', 6, 'Kinh nghiệm lâu năm', 4.9, 70, 300, '2019-09-01', 3, NULL),

-- Shop 4 - 5 thợ
(16, 'Trần Văn Quang', 'https://i.pravatar.cc/150?img=45', '0977777777', 'quang@shop4.com', 'Cắt tóc nam', 7, 'Thợ trưởng Hà Nội', 4.9, 85, 380, '2018-06-01', 4, NULL),
(17, 'Lê Văn Hòa', 'https://i.pravatar.cc/150?img=46', '0978888888', 'hoa@shop4.com', 'Cắt tóc, Nhuộm', 4, 'Phong cách thanh lịch', 4.7, 38, 150, '2020-11-01', 4, NULL),
(18, 'Phạm Văn Bảo', 'https://i.pravatar.cc/150?img=47', '0979999999', 'bao@shop4.com', 'Cắt tóc, Uốn', 5, 'Chuyên tóc xoăn', 4.8, 50, 200, '2019-12-01', 4, NULL),
(19, 'Nguyễn Tiến Đạt', 'https://i.pravatar.cc/150?img=48', '0961111111', 'dat@shop4.com', 'Cắt tóc, Gội', 3, 'Năng động, vui vẻ', 4.5, 25, 100, '2021-10-01', 4, NULL),
(20, 'Trần Văn Minh', 'https://i.pravatar.cc/150?img=49', '0962222222', 'minh2@shop4.com', 'Cắt tóc cao cấp', 6, 'Chuyên gia tóc quý ông', 4.9, 60, 250, '2019-03-01', 4, NULL),

-- Shop 5 - 5 thợ
(21, 'Lê Văn Thành', 'https://i.pravatar.cc/150?img=50', '0963333333', 'thanh@shop5.com', 'Cắt tóc nam', 5, 'Top thợ Đà Nẵng', 4.8, 55, 230, '2019-08-01', 5, NULL),
(22, 'Phạm Văn Tài', 'https://i.pravatar.cc/150?img=51', '0964444444', 'tai@shop5.com', 'Cắt tóc, Nhuộm', 4, 'Phong cách trẻ', 4.6, 35, 140, '2020-12-01', 5, NULL),
(23, 'Nguyễn Văn Hải', 'https://i.pravatar.cc/150?img=52', '0965555555', 'hai2@shop5.com', 'Cắt tóc, Shave', 3, 'Cẩn thận, tỉ mỉ', 4.5, 28, 110, '2021-09-01', 5, NULL),
(24, 'Trần Văn Phú', 'https://i.pravatar.cc/150?img=53', '0966666666', 'phu@shop5.com', 'Cắt tóc, Gội đầu', 4, 'Kinh nghiệm 4 năm', 4.7, 42, 170, '2020-05-01', 5, NULL),
(25, 'Lê Văn Sơn', 'https://i.pravatar.cc/150?img=54', '0967777777', 'son2@shop5.com', 'Cắt tóc cao cấp', 6, 'Chuyên gia tóc nam miền Trung', 4.9, 65, 270, '2019-02-01', 5, NULL);

-- ============================================================================
-- 4. SERVICES (Mỗi shop 4-5 dịch vụ)
-- ============================================================================
INSERT INTO Services (name, description, price, duration, category, isPopular, isActive, ShopId) VALUES
-- Shop 1 (5 dịch vụ)
('Cắt tóc nam', 'Cắt tóc nam phong cách hiện đại', 80000, 30, 'Cắt tóc', TRUE, TRUE, 1),
('Cắt tóc + Gội đầu', 'Cắt tóc kèm gội đầu thư giãn', 100000, 45, 'Cắt tóc', TRUE, TRUE, 1),
('Nhuộm tóc nam', 'Nhuộm tóc nam chuyên nghiệp', 200000, 90, 'Nhuộm', FALSE, TRUE, 1),
('Uốn tóc nam', 'Uốn tóc nam theo yêu cầu', 250000, 120, 'Uốn', FALSE, TRUE, 1),
('Hot Towel Shave', 'Cạo mặt bằng khăn nóng', 60000, 20, 'Shave', TRUE, TRUE, 1),

-- Shop 2 (5 dịch vụ)
('Classic Cut', 'Cắt tóc phong cách cổ điển', 100000, 35, 'Cắt tóc', TRUE, TRUE, 2),
('Hot Towel Shave', 'Cạo mặt bằng khăn nóng', 80000, 25, 'Shave', TRUE, TRUE, 2),
('Beard Trim', 'Tỉa lông mày, beard', 50000, 15, 'Shave', FALSE, TRUE, 2),
('Nhuộm tóc', 'Nhuộm tóc nam chuyên nghiệp', 180000, 80, 'Nhuộm', FALSE, TRUE, 2),
('Cắt + Gội', 'Cắt tóc và gội đầu', 90000, 40, 'Cắt tóc', TRUE, TRUE, 2),

-- Shop 3 (5 dịch vụ)
('Premium Cut', 'Cắt tóc cao cấp', 150000, 45, 'Cắt tóc', TRUE, TRUE, 3),
('Korean Style', 'Cắt tóc phong cách Hàn Quốc', 120000, 40, 'Cắt tóc', TRUE, TRUE, 3),
('Color & Style', 'Nhuộm và tạo kiểu', 280000, 120, 'Nhuộm', FALSE, TRUE, 3),
('Hair Spa', 'Dưỡng tóc chuyên sâu', 200000, 60, 'Dưỡng', FALSE, TRUE, 3),
('Gội & Massage', 'Gội đầu + massage thư giãn', 80000, 35, 'Gội', TRUE, TRUE, 3),

-- Shop 4 (4 dịch vụ)
('Gentleman Cut', 'Cắt tóc quý ông', 90000, 35, 'Cắt tóc', TRUE, TRUE, 4),
('Royal Shave', 'Cạo mặt hoàng gia', 100000, 30, 'Shave', TRUE, TRUE, 4),
('Beard Styling', 'Tạo kiểu râu', 70000, 20, 'Shave', FALSE, TRUE, 4),
('Hair Treatment', 'Điều trị tóc', 150000, 45, 'Dưỡng', FALSE, TRUE, 4),

-- Shop 5 (5 dịch vụ)
('Modern Cut', 'Cắt tóc hiện đại', 85000, 30, 'Cắt tóc', TRUE, TRUE, 5),
('Comfort Cut', 'Cắt + gội thoải mái', 95000, 40, 'Cắt tóc', TRUE, TRUE, 5),
('Beard Care', 'Chăm sóc râu', 60000, 20, 'Shave', FALSE, TRUE, 5),
('Hair Color', 'Nhuộm tóc nam', 190000, 85, 'Nhuộm', FALSE, TRUE, 5),
('Deep Clean', 'Gội và dưỡng sâu', 70000, 30, 'Gội', FALSE, TRUE, 5);

-- ============================================================================
-- 5. WORKING_SCHEDULES (Lịch làm việc cho 25 thợ - mỗi thợ 7 ngày)
-- ============================================================================
INSERT INTO WorkingSchedules (dayOfWeek, startTime, endTime, isWorking, breakStart, breakEnd, BarberId) VALUES
-- Barber 1-5 (Shop 1)
('monday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('tuesday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('wednesday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('thursday', '09:00', '18:00', TRUE, '12:00', '13:00', 1),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 1),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 1),
('sunday', '09:00', '18:00', FALSE, NULL, NULL, 1),

('monday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('tuesday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('wednesday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('thursday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('friday', '10:00', '20:00', TRUE, '13:00', '14:00', 2),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 2),
('sunday', '10:00', '18:00', TRUE, '13:00', '14:00', 2),

('monday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('tuesday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('wednesday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('thursday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('friday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('saturday', '08:00', '21:00', TRUE, '12:00', '13:00', 3),
('sunday', '08:00', '18:00', TRUE, '12:00', '13:00', 3),

('monday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('tuesday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('wednesday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('thursday', '09:00', '19:00', TRUE, '12:00', '13:00', 4),
('friday', '09:00', '20:00', TRUE, '12:00', '13:00', 4),
('saturday', '09:00', '20:00', TRUE, '12:00', '13:00', 4),
('sunday', '09:00', '17:00', TRUE, '12:00', '13:00', 4),

('monday', '10:00', '19:00', TRUE, '13:00', '14:00', 5),
('tuesday', '10:00', '19:00', TRUE, '13:00', '14:00', 5),
('wednesday', '10:00', '19:00', TRUE, '13:00', '14:00', 5),
('thursday', '10:00', '19:00', TRUE, '13:00', '14:00', 5),
('friday', '10:00', '21:00', TRUE, '13:00', '14:00', 5),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 5),
('sunday', '10:00', '18:00', FALSE, NULL, NULL, 5),

-- Barber 6-10 (Shop 2)
('monday', '09:00', '18:00', TRUE, '12:00', '13:00', 6),
('tuesday', '09:00', '18:00', TRUE, '12:00', '13:00', 6),
('wednesday', '09:00', '18:00', TRUE, '12:00', '13:00', 6),
('thursday', '09:00', '18:00', TRUE, '12:00', '13:00', 6),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 6),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 6),
('sunday', '09:00', '18:00', FALSE, NULL, NULL, 6),

('monday', '10:00', '20:00', TRUE, '13:00', '14:00', 7),
('tuesday', '10:00', '20:00', TRUE, '13:00', '14:00', 7),
('wednesday', '10:00', '20:00', TRUE, '13:00', '14:00', 7),
('thursday', '10:00', '20:00', TRUE, '13:00', '14:00', 7),
('friday', '10:00', '20:00', TRUE, '13:00', '14:00', 7),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 7),
('sunday', '10:00', '18:00', TRUE, '13:00', '14:00', 7),

('monday', '09:00', '19:00', TRUE, '12:00', '13:00', 8),
('tuesday', '09:00', '19:00', TRUE, '12:00', '13:00', 8),
('wednesday', '09:00', '19:00', TRUE, '12:00', '13:00', 8),
('thursday', '09:00', '19:00', TRUE, '12:00', '13:00', 8),
('friday', '09:00', '20:00', TRUE, '12:00', '13:00', 8),
('saturday', '09:00', '20:00', TRUE, '12:00', '13:00', 8),
('sunday', '09:00', '17:00', TRUE, '12:00', '13:00', 8),

('monday', '08:00', '21:00', TRUE, '12:00', '13:00', 9),
('tuesday', '08:00', '21:00', TRUE, '12:00', '13:00', 9),
('wednesday', '08:00', '21:00', TRUE, '12:00', '13:00', 9),
('thursday', '08:00', '21:00', TRUE, '12:00', '13:00', 9),
('friday', '08:00', '21:00', TRUE, '12:00', '13:00', 9),
('saturday', '08:00', '21:00', TRUE, '12:00', '13:00', 9),
('sunday', '08:00', '18:00', TRUE, '12:00', '13:00', 9),

('monday', '10:00', '19:00', TRUE, '13:00', '14:00', 10),
('tuesday', '10:00', '19:00', TRUE, '13:00', '14:00', 10),
('wednesday', '10:00', '19:00', TRUE, '13:00', '14:00', 10),
('thursday', '10:00', '19:00', TRUE, '13:00', '14:00', 10),
('friday', '10:00', '21:00', TRUE, '13:00', '14:00', 10),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 10),
('sunday', '10:00', '18:00', FALSE, NULL, NULL, 10),

-- Barber 11-15 (Shop 3)
('monday', '10:00', '22:00', TRUE, '13:00', '14:00', 11),
('tuesday', '10:00', '22:00', TRUE, '13:00', '14:00', 11),
('wednesday', '10:00', '22:00', TRUE, '13:00', '14:00', 11),
('thursday', '10:00', '22:00', TRUE, '13:00', '14:00', 11),
('friday', '10:00', '22:00', TRUE, '13:00', '14:00', 11),
('saturday', '10:00', '22:00', TRUE, '13:00', '14:00', 11),
('sunday', '10:00', '20:00', TRUE, '13:00', '14:00', 11),

('monday', '09:00', '20:00', TRUE, '12:00', '13:00', 12),
('tuesday', '09:00', '20:00', TRUE, '12:00', '13:00', 12),
('wednesday', '09:00', '20:00', TRUE, '12:00', '13:00', 12),
('thursday', '09:00', '20:00', TRUE, '12:00', '13:00', 12),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 12),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 12),
('sunday', '09:00', '18:00', TRUE, '12:00', '13:00', 12),

('monday', '10:00', '20:00', TRUE, '13:00', '14:00', 13),
('tuesday', '10:00', '20:00', TRUE, '13:00', '14:00', 13),
('wednesday', '10:00', '20:00', TRUE, '13:00', '14:00', 13),
('thursday', '10:00', '20:00', TRUE, '13:00', '14:00', 13),
('friday', '10:00', '21:00', TRUE, '13:00', '14:00', 13),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 13),
('sunday', '10:00', '18:00', FALSE, NULL, NULL, 13),

('monday', '11:00', '20:00', TRUE, '13:00', '14:00', 14),
('tuesday', '11:00', '20:00', TRUE, '13:00', '14:00', 14),
('wednesday', '11:00', '20:00', TRUE, '13:00', '14:00', 14),
('thursday', '11:00', '20:00', TRUE, '13:00', '14:00', 14),
('friday', '11:00', '21:00', TRUE, '13:00', '14:00', 14),
('saturday', '11:00', '21:00', TRUE, '13:00', '14:00', 14),
('sunday', '11:00', '18:00', TRUE, '13:00', '14:00', 14),

('monday', '09:00', '21:00', TRUE, '12:00', '13:00', 15),
('tuesday', '09:00', '21:00', TRUE, '12:00', '13:00', 15),
('wednesday', '09:00', '21:00', TRUE, '12:00', '13:00', 15),
('thursday', '09:00', '21:00', TRUE, '12:00', '13:00', 15),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 15),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 15),
('sunday', '09:00', '18:00', TRUE, '12:00', '13:00', 15),

-- Barber 16-20 (Shop 4)
('monday', '09:00', '20:00', TRUE, '12:00', '13:00', 16),
('tuesday', '09:00', '20:00', TRUE, '12:00', '13:00', 16),
('wednesday', '09:00', '20:00', TRUE, '12:00', '13:00', 16),
('thursday', '09:00', '20:00', TRUE, '12:00', '13:00', 16),
('friday', '09:00', '20:00', TRUE, '12:00', '13:00', 16),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 16),
('sunday', '09:00', '18:00', FALSE, NULL, NULL, 16),

('monday', '10:00', '19:00', TRUE, '13:00', '14:00', 17),
('tuesday', '10:00', '19:00', TRUE, '13:00', '14:00', 17),
('wednesday', '10:00', '19:00', TRUE, '13:00', '14:00', 17),
('thursday', '10:00', '19:00', TRUE, '13:00', '14:00', 17),
('friday', '10:00', '20:00', TRUE, '13:00', '14:00', 17),
('saturday', '10:00', '20:00', TRUE, '13:00', '14:00', 17),
('sunday', '10:00', '18:00', TRUE, '13:00', '14:00', 17),

('monday', '09:00', '20:00', TRUE, '12:00', '13:00', 18),
('tuesday', '09:00', '20:00', TRUE, '12:00', '13:00', 18),
('wednesday', '09:00', '20:00', TRUE, '12:00', '13:00', 18),
('thursday', '09:00', '20:00', TRUE, '12:00', '13:00', 18),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 18),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 18),
('sunday', '09:00', '18:00', TRUE, '12:00', '13:00', 18),

('monday', '10:00', '19:00', TRUE, '13:00', '14:00', 19),
('tuesday', '10:00', '19:00', TRUE, '13:00', '14:00', 19),
('wednesday', '10:00', '19:00', TRUE, '13:00', '14:00', 19),
('thursday', '10:00', '19:00', TRUE, '13:00', '14:00', 19),
('friday', '10:00', '20:00', TRUE, '13:00', '14:00', 19),
('saturday', '10:00', '20:00', TRUE, '13:00', '14:00', 19),
('sunday', '10:00', '17:00', TRUE, '13:00', '14:00', 19),

('monday', '08:00', '20:00', TRUE, '12:00', '13:00', 20),
('tuesday', '08:00', '20:00', TRUE, '12:00', '13:00', 20),
('wednesday', '08:00', '20:00', TRUE, '12:00', '13:00', 20),
('thursday', '08:00', '20:00', TRUE, '12:00', '13:00', 20),
('friday', '08:00', '21:00', TRUE, '12:00', '13:00', 20),
('saturday', '08:00', '21:00', TRUE, '12:00', '13:00', 20),
('sunday', '08:00', '18:00', TRUE, '12:00', '13:00', 20),

-- Barber 21-25 (Shop 5)
('monday', '09:00', '21:00', TRUE, '12:00', '13:00', 21),
('tuesday', '09:00', '21:00', TRUE, '12:00', '13:00', 21),
('wednesday', '09:00', '21:00', TRUE, '12:00', '13:00', 21),
('thursday', '09:00', '21:00', TRUE, '12:00', '13:00', 21),
('friday', '09:00', '21:00', TRUE, '12:00', '13:00', 21),
('saturday', '09:00', '21:00', TRUE, '12:00', '13:00', 21),
('sunday', '09:00', '18:00', TRUE, '12:00', '13:00', 21),

('monday', '10:00', '20:00', TRUE, '13:00', '14:00', 22),
('tuesday', '10:00', '20:00', TRUE, '13:00', '14:00', 22),
('wednesday', '10:00', '20:00', TRUE, '13:00', '14:00', 22),
('thursday', '10:00', '20:00', TRUE, '13:00', '14:00', 22),
('friday', '10:00', '21:00', TRUE, '13:00', '14:00', 22),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 22),
('sunday', '10:00', '18:00', FALSE, NULL, NULL, 22),

('monday', '09:00', '19:00', TRUE, '12:00', '13:00', 23),
('tuesday', '09:00', '19:00', TRUE, '12:00', '13:00', 23),
('wednesday', '09:00', '19:00', TRUE, '12:00', '13:00', 23),
('thursday', '09:00', '19:00', TRUE, '12:00', '13:00', 23),
('friday', '09:00', '20:00', TRUE, '12:00', '13:00', 23),
('saturday', '09:00', '20:00', TRUE, '12:00', '13:00', 23),
('sunday', '09:00', '17:00', TRUE, '12:00', '13:00', 23),

('monday', '10:00', '20:00', TRUE, '13:00', '14:00', 24),
('tuesday', '10:00', '20:00', TRUE, '13:00', '14:00', 24),
('wednesday', '10:00', '20:00', TRUE, '13:00', '14:00', 24),
('thursday', '10:00', '20:00', TRUE, '13:00', '14:00', 24),
('friday', '10:00', '21:00', TRUE, '13:00', '14:00', 24),
('saturday', '10:00', '21:00', TRUE, '13:00', '14:00', 24),
('sunday', '10:00', '18:00', TRUE, '13:00', '14:00', 24),

('monday', '08:00', '21:00', TRUE, '12:00', '13:00', 25),
('tuesday', '08:00', '21:00', TRUE, '12:00', '13:00', 25),
('wednesday', '08:00', '21:00', TRUE, '12:00', '13:00', 25),
('thursday', '08:00', '21:00', TRUE, '12:00', '13:00', 25),
('friday', '08:00', '21:00', TRUE, '12:00', '13:00', 25),
('saturday', '08:00', '21:00', TRUE, '12:00', '13:00', 25),
('sunday', '08:00', '18:00', TRUE, '12:00', '13:00', 25);

-- ============================================================================
-- SEED COMPLETE!
-- ============================================================================