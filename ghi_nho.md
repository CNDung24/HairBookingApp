# Ghi nhớ - Hair Booking Project

---

## Lỗi đầu tiên: Thiếu module coupon.controller

**Lỗi:**
```
Error: Cannot find module '../controllers/coupon.controller'
```

**Nguyên nhân:** File `coupon.controller.js` không tồn tại nhưng được import trong `shop.routes.js`

**Giải pháp:**
- Thêm function `getCouponsByShop` vào `shop.controller.js`
- Sửa `shop.routes.js` dùng `controller.getCouponsByShop` thay vì `couponController`

---

## Yêu cầu: Xóa toàn bộ chức năng Coupon

**Kế hoạch đã thực hiện:**

### Backend (9 files)

| File | Thay đổi |
|------|----------|
| `backend/src/routes/shop.routes.js` | Xóa route `/:id/coupons` |
| `backend/src/controllers/shop.controller.js` | Xóa import `Coupon`, xóa function `getCouponsByShop` |
| `backend/src/routes/shop_owner.routes.js` | Xóa 4 coupon routes |
| `backend/src/controllers/shop_owner.controller.js` | Xóa import `Coupon, UserCoupon`, xóa 4 functions (getMyCoupons, createCoupon, updateCoupon, deleteCoupon) |
| `backend/src/controllers/booking.controller.js` | Xóa import `Coupon`, xóa logic áp dụng coupon trong createBooking |
| `backend/src/routes/couponAdmin.routes.js` | **Xóa file** |
| `backend/migrate_add_couponid.js` | **Xóa file** |

### Frontend (2 files)

| File | Thay đổi |
|------|----------|
| `HairBooking/src/screens/ShopDetailScreen.js` | Xóa toàn bộ coupon UI (nhập mã, danh sách, hiển thị giảm giá), xóa state couponCode, appliedCoupon |
| `HairBooking/src/screens/BookingScreen.js` | Xóa coupon từ route params và bookingData |

**Kết quả:** Server khởi động thành công.

---

## Yêu cầu: Xóa bộ lọc danh mục dịch vụ (Cắt tóc, Gội đầu, Nhuộm, Massage)

**Thay đổi trong `ShopDetailScreen.js`:**

1. Xóa constant `CATEGORIES`:
```javascript
const CATEGORIES = [
    { id: 'all', name: 'Tất cả', icon: 'grid-outline' },
    { id: 'cut', name: 'Cắt tóc', icon: 'cut-outline' },
    { id: 'wash', name: 'Gội đầu', icon: 'water-outline' },
    { id: 'dye', name: 'Nhuộm', icon: 'color-palette-outline' },
    { id: 'massage', name: 'Massage', icon: 'happy-outline' },
];
```

2. Xóa state `selectedCategory`

3. Sửa `filteredServices` - bỏ logic lọc theo category:
```javascript
const filteredServices = services?.filter(s => {
    const matchesSearch = !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
});
```

4. Xóa UI category filter (ScrollView với các nút Cắt tóc, Gội đầu...)

5. Xóa các style liên quan: `categorySection`, `categoryList`, `categoryItem`, `categoryItemActive`, `categoryText`, `categoryTextActive`

**Kết quả:** Giờ chỉ còn hiển thị danh sách dịch vụ và tìm kiếm, không còn bộ lọc danh mục.

---

## Tổng quan Database (Database.txt)

### Models có trong hệ thống:
- **User** - user/role: customer, admin, shop_owner, barber
- **Shop** - cửa hàng
- **Barber** - thợ cắt tóc
- **Service** - dịch vụ
- **Booking** - lịch hẹn
- **Review** - đánh giá
- **WorkingSchedule** - lịch làm việc
- **Notification** - thông báo
- **Payment** - thanh toán
- **ShopRequest** - yêu cầu đăng ký shop
- **Coupon** - (đã xóa)
- **UserCoupon** - (đã xóa)

### Routes trong app.js:
- `/api/auth` - authentication
- `/api/shops` - shops
- `/api/bookings` - bookings
- `/api/barber` - barbers
- `/api/admin` - admin
- `/api/shop-owner` - shop owner
- `/api/services` - services
- `/api/schedule` - working schedule
- `/api/payments` - payments
- `/api/shop-requests` - shop requests

---

## Frontend (React Native/Expo)

### 4 nhóm user:
- **Customer**: Home, Search, ShopDetail, Booking, MyBookings, Profile, Notifications
- **Admin**: ManageUsers, ManageShops, ManageBookings, ManageShopRequests, Dashboard
- **Shop Owner**: ManageShop, ManageBarbers, ManageServices, ManageReviews, ManageSchedule, Dashboard
- **Barber**: Schedule, Dashboard

---

## Tính năng đã hoàn thiện (Update ngày 14/03/2026)

### Backend - Tính năng mới:

| Tính năng | File | Mô tả |
|------------|------|--------|
| **Review API** | `review.controller.js`, `review.routes.js` | CRUD review, tự động cập nhật rating cho barber/shop |
| **Notification API** | `notification.controller.js`, `notification.routes.js` | Gửi, đọc, xóa notification |
| **WorkingSchedule API** | `workingSchedule.controller.js` | Thêm API cho shop owner quản lý lịch tất cả thợ |
| **Upload ảnh** | `upload.controller.js`, `upload.routes.js` | Upload single/multiple ảnh, xóa ảnh |
| **Booking API** | `booking.controller.js` | API getAvailableSlots đã có sẵn |

### Frontend - Tính năng mới:

| Tính năng | File | Mô tả |
|------------|------|--------|
| **Reset Password** | `ResetPasswordScreen.js` | Quên mật khẩu / Đặt lại mật khẩu |
| **Notification Screen** | `NotificationScreen.js` | Xem danh sách thông báo |
| **Review UI** | `ShopDetailScreen.js` | Hiển thị reviews trong shop detail (đã có sẵn) |
| **Manage Schedule** | `ManageScheduleScreen.js` | Shop owner quản lý lịch làm việc của thợ |
| **Upload ảnh** | `ImagePickerButton.js` | Component tái sử dụng cho upload ảnh |
| **BookingScreen** | `BookingScreen.js` | Dùng API getAvailableSlots thay vì TIME_SLOTS cứng |

### Routes mới trong app.js:
- `/api/reviews` - Review API
- `/api/notifications` - Notification API  
- `/api/upload` - Upload ảnh

### Package mới cài đặt:
- **Backend**: `multer`
- **Frontend**: `expo-image-picker`

---

## Lưu ý khi chạy:

1. **Backend**: Tạo thư mục `uploads` trong `backend/`
2. **Frontend**: Profile có thêm menu "Thông báo"
3. **Shop Owner**: Có thêm màn hình "Quản lý lịch làm việc"
