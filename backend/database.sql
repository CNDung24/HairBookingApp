-- ============================================================================
-- HAIR BOOKING DATABASE - CHẠY TỪ ĐẦU ĐẾN CUỐI
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng cũ nếu tồn tại (theo thứ tự phụ thuộc ngược)
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS WorkingSchedules;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Services;
DROP TABLE IF EXISTS Barbers;
DROP TABLE IF EXISTS Shops;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS ShopRequests;
DROP TABLE IF EXISTS UserCoupons;
DROP TABLE IF EXISTS Coupons;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. SHOPS (Cửa hàng)
-- ============================================================================
CREATE TABLE Shops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    image TEXT,
    logo TEXT,
    description TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    openingTime VARCHAR(10),
    closingTime VARCHAR(10),
    isOpen BOOLEAN DEFAULT TRUE,
    isActive BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 0,
    totalReviews INT DEFAULT 0,
    totalBookings INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. USERS (Người dùng)
-- ============================================================================
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar TEXT,
    gender ENUM('male', 'female', 'other'),
    birthday DATE,
    address TEXT,
    role ENUM('customer', 'admin', 'shop_owner') DEFAULT 'customer',
    ShopId INT NULL,
    BarberProfileId INT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    lastLogin DATETIME,
    resetToken VARCHAR(255),
    resetTokenExpiry DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ShopId) REFERENCES Shops(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- 3. BARBERS (Thợ cắt tóc)
-- ============================================================================
CREATE TABLE Barbers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    avatar TEXT,
    phone VARCHAR(20),
    email VARCHAR(150),
    specialty VARCHAR(100),
    experience INT,
    bio TEXT,
    isActive BOOLEAN DEFAULT TRUE,
    isAvailable BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 0,
    totalReviews INT DEFAULT 0,
    totalCustomers INT DEFAULT 0,
    joinDate DATE,
    ShopId INT,
    UserId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ShopId) REFERENCES Shops(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE Users ADD FOREIGN KEY (BarberProfileId) REFERENCES Barbers(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- 4. SERVICES (Dịch vụ)
-- ============================================================================
CREATE TABLE Services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    duration INT NOT NULL,
    image TEXT,
    category VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    isPopular BOOLEAN DEFAULT FALSE,
    discountPrice FLOAT,
    discountEndDate DATE,
    ShopId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ShopId) REFERENCES Shops(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 5. BOOKINGS (Lịch hẹn)
-- ============================================================================
CREATE TABLE Bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    actual_price FLOAT,
    original_price FLOAT,
    discount_amount FLOAT DEFAULT 0,
    status ENUM('pending', 'confirmed', 'checked_in', 'done', 'cancelled', 'no_show') DEFAULT 'pending',
    note TEXT,
    cancelReason TEXT,
    cancelledAt DATETIME,
    cancelledBy INT,
    confirmedAt DATETIME,
    checkedInAt DATETIME,
    completedAt DATETIME,
    paymentMethod ENUM('cash', 'card', 'online'),
    paymentStatus ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    reminderSent BOOLEAN DEFAULT FALSE,
    UserId INT,
    ShopId INT,
    BarberId INT,
    ServiceId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ShopId) REFERENCES Shops(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (BarberId) REFERENCES Barbers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (ServiceId) REFERENCES Services(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (cancelledBy) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- 6. REVIEWS (Đánh giá)
-- ============================================================================
CREATE TABLE Reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images JSON,
    isVerified BOOLEAN DEFAULT FALSE,
    isActive BOOLEAN DEFAULT TRUE,
    staffRating INT CHECK (staffRating >= 1 AND staffRating <= 5),
    serviceRating INT CHECK (serviceRating >= 1 AND serviceRating <= 5),
    environmentRating INT CHECK (environmentRating >= 1 AND environmentRating <= 5),
    reply TEXT,
    repliedAt DATETIME,
    UserId INT,
    BarberId INT,
    ShopId INT,
    BookingId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (BarberId) REFERENCES Barbers(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (ShopId) REFERENCES Shops(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (BookingId) REFERENCES Bookings(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- 7. WORKING_SCHEDULES (Lịch làm việc)
-- ============================================================================
CREATE TABLE WorkingSchedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dayOfWeek ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    startTime VARCHAR(10) NOT NULL,
    endTime VARCHAR(10) NOT NULL,
    isWorking BOOLEAN DEFAULT TRUE,
    breakStart VARCHAR(10),
    breakEnd VARCHAR(10),
    specificDate DATE,
    isOff BOOLEAN DEFAULT FALSE,
    offReason VARCHAR(255),
    BarberId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (BarberId) REFERENCES Barbers(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 8. NOTIFICATIONS (Thông báo)
-- ============================================================================
CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('booking', 'reminder', 'promotion', 'system', 'review') DEFAULT 'system',
    data JSON,
    isRead BOOLEAN DEFAULT FALSE,
    readAt DATETIME,
    isSent BOOLEAN DEFAULT FALSE,
    sentAt DATETIME,
    scheduledAt DATETIME,
    UserId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- 9. PAYMENTS (Thanh toán)
-- ============================================================================
CREATE TABLE Payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount FLOAT NOT NULL,
    paymentMethod ENUM('cash', 'momo', 'vnpay', 'zalopay') NOT NULL,
    paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transactionId VARCHAR(255),
    paymentUrl TEXT,
    callbackData JSON,
    paidAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    bookingId INT,
    FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================================
-- 10. SHOP REQUESTS (Yêu cầu đăng ký shop)
-- ============================================================================
CREATE TABLE ShopRequests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(150),
    description TEXT,
    openingTime VARCHAR(10),
    closingTime VARCHAR(10),
    logo TEXT,
    image TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejectReason TEXT,
    UserId INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_shops_city ON Shops(city);
CREATE INDEX idx_barbers_shop ON Barbers(ShopId);
CREATE INDEX idx_barbers_user ON Barbers(UserId);
CREATE INDEX idx_services_shop ON Services(ShopId);
CREATE INDEX idx_bookings_user ON Bookings(UserId);
CREATE INDEX idx_bookings_barber ON Bookings(BarberId);
CREATE INDEX idx_bookings_date ON Bookings(booking_date);
CREATE INDEX idx_bookings_status ON Bookings(status);
CREATE INDEX idx_reviews_barber ON Reviews(BarberId);
CREATE INDEX idx_reviews_shop ON Reviews(ShopId);
CREATE INDEX idx_reviews_booking ON Reviews(BookingId);
CREATE INDEX idx_notifications_user ON Notifications(UserId);
CREATE INDEX idx_notifications_isread ON Notifications(isRead);
CREATE INDEX idx_payments_booking ON Payments(bookingId);
CREATE INDEX idx_shop_requests_user ON ShopRequests(UserId);
CREATE INDEX idx_shop_requests_status ON ShopRequests(status);

-- ============================================================================
-- DONE!
-- ============================================================================
