import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOW } from '../theme';

// Hàm xử lý ngày tháng
const parseDate = (dateStr) => {
    // Giả lập xử lý ngày: "2024-02-14" -> Day: 14, Month: THG 02
    // Trong thực tế bạn dùng new Date(dateStr)
    const d = new Date(dateStr);
    const day = d.getDate() || '14';
    const month = `THG ${d.getMonth() + 1}` || 'THG 2';
    return { day, month };
};

const getStatusColor = (status) => {
    switch (status) {
        case 'confirmed': return { text: COLORS.success, bg: COLORS.successBg, label: 'Đã xác nhận' };
        case 'pending': return { text: COLORS.pending, bg: COLORS.pendingBg, label: 'Chờ duyệt' };
        case 'cancelled': return { text: COLORS.error, bg: COLORS.errorBg, label: 'Đã hủy' };
        case 'done': return { text: COLORS.success, bg: COLORS.successBg, label: 'Hoàn thành' };
        case 'checked_in': return { text: '#8B5CF6', bg: '#EDE9FE', label: 'Đã check-in' };
        case 'no_show': return { text: COLORS.textLight, bg: '#F3F4F6', label: 'Không đến' };
        default: return { text: COLORS.textLight, bg: COLORS.background, label: status };
    }
};

export const BookingCard = ({ booking, onPress }) => {
    const { day, month } = parseDate(booking.booking_date || new Date());
    const statusStyle = getStatusColor(booking.status);

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={onPress}
        >
            {/* --- LEFT COLUMN: DATE BLOCK --- */}
            <View style={styles.dateBlock}>
                <Text style={styles.dateMonth}>{month}</Text>
                <Text style={styles.dateDay}>{day}</Text>
                <View style={styles.verticalLine} />
            </View>

            {/* --- RIGHT COLUMN: INFO --- */}
            <View style={styles.infoBlock}>
                {/* Header: Shop Name & Status */}
                <View style={styles.headerRow}>
                    <Text style={styles.shopName} numberOfLines={1}>
                        {booking.Shop?.name || 'Barber Shop'}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                {/* Main: Service Name */}
                <Text style={styles.serviceName} numberOfLines={2}>
                    {booking.Service?.name || 'Cắt tóc & Tạo kiểu Layer'}
                </Text>

                {/* Footer: Time & Stylist */}
                <View style={styles.footerRow}>
                    <View style={styles.timeContainer}>
                        <View style={styles.dot} />
                        <Text style={styles.timeText}>{booking.booking_time}</Text>
                    </View>
                    <Text style={styles.stylistText}>
                        Stylist: {booking.stylist || 'Ngẫu nhiên'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l, // Bo góc lớn (24px)
        marginBottom: SPACING.m,
        overflow: 'hidden', // Để bo góc đẹp
        borderWidth: 1,
        borderColor: COLORS.background, // Viền cực mờ hòa vào nền
        ...SHADOW,
    },

    // --- Styles Cột Trái (Date) ---
    dateBlock: {
        width: 80,
        backgroundColor: COLORS.primarySoft, // Nền cam nhạt
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.m,
        position: 'relative',
    },
    dateMonth: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.primary, // Chữ cam đậm
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    dateDay: {
        fontSize: 28,
        fontWeight: '800', // Extra Bold
        color: COLORS.title,
    },
    verticalLine: {
        // Tạo hiệu ứng đường đứt đoạn ngăn cách (tùy chọn)
        position: 'absolute',
        right: 0,
        top: '20%',
        bottom: '20%',
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },

    // --- Styles Cột Phải (Info) ---
    infoBlock: {
        flex: 1,
        padding: SPACING.m,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    shopName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        maxWidth: '60%',
    },

    // Status Badge dạng "Viên thuốc" nhỏ gọn
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.s,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },

    // Tên dịch vụ to, rõ ràng
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.title,
        marginBottom: SPACING.s + 4,
        lineHeight: 22,
    },

    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9', // Nền xám cho giờ
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.s,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        marginRight: 6,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLORS.text,
    },
    stylistText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
    }
});