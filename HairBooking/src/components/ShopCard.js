import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOW } from '../theme';
import { Ionicons as Icon } from '@expo/vector-icons';

const isShopOpen = (openingTime, closingTime) => {
    if (!openingTime || !closingTime) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);

    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const openTotalMinutes = openHour * 60 + openMinute;
    const closeTotalMinutes = closeHour * 60 + closeMinute;

    if (closeTotalMinutes < openTotalMinutes) {
        return currentTotalMinutes >= openTotalMinutes || currentTotalMinutes < closeTotalMinutes;
    }

    return currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes;
};

export const ShopCard = ({ shop, onPress }) => {
    const distance = shop.distance || '1.2 km';
    const isOpen = isShopOpen(shop.openingTime, shop.closingTime);
    const rating = shop.rating || 4.8;
    const reviewCount = shop.totalReviews ?? shop.reviewCount ?? 0;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* --- IMAGE SECTION --- */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: shop.image || 'https://via.placeholder.com/400x200' }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Badge: Rating (Góc trái trên) */}
                <View style={styles.ratingBadge}>
                    <Icon name="star" size={12} color={COLORS.primary} />
                    <Text style={styles.ratingText}>{rating}</Text>
                    <Text style={styles.reviewCount}>({reviewCount})</Text>
                </View>

                {/* Badge: Status (Góc phải trên) - Đang mở / Đóng cửa */}
                {isOpen ? (
                    <View style={styles.statusBadgeOpen}>
                        <View style={styles.statusDotOpen} />
                        <Text style={styles.statusTextOpen}>Đang mở</Text>
                    </View>
                ) : (
                    <View style={styles.statusBadgeClosed}>
                        <View style={styles.statusDotClosed} />
                        <Text style={styles.statusTextClosed}>Đóng cửa</Text>
                    </View>
                )}
            </View>

            {/* --- CONTENT SECTION --- */}
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {shop.name}
                    </Text>

                    {/* Badge khoảng cách */}
                    <View style={styles.distanceBadge}>
                        <Icon name="navigate-outline" size={12} color={COLORS.primary} />
                        <Text style={styles.distanceText}>{distance}</Text>
                    </View>
                </View>

                <View style={styles.addressRow}>
                    <Icon name="location-sharp" size={14} color={COLORS.textLight} style={{ marginTop: 2 }} />
                    <Text style={styles.address} numberOfLines={2}>
                        {shop.address || 'Chưa cập nhật địa chỉ'}
                    </Text>
                </View>

                {/* Tags (Dịch vụ nổi bật) */}
                <View style={styles.tagsRow}>
                    {['Cắt tóc', 'Gội đầu', 'Massage'].map((tag, index) => (
                        <Text key={index} style={styles.tagText}>• {tag}</Text>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        marginBottom: SPACING.m + 4,
        ...SHADOW,
        borderWidth: 1,
        borderColor: COLORS.border || '#F3F4F6',
    },
    imageContainer: {
        height: 180,
        width: '100%',
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },

    // --- FLOATING BADGES ---
    ratingBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.s,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.title,
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 10,
        color: COLORS.textLight,
        marginLeft: 2,
    },

    statusBadgeOpen: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.95)', // xanh lá
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: RADIUS.s,
    },
    statusDotOpen: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statusTextOpen: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    statusBadgeClosed: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.95)', // đỏ
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: RADIUS.s,
    },
    statusDotClosed: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        marginRight: 6,
    },
    statusTextClosed: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    // --- CONTENT ---
    content: {
        padding: SPACING.m,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.title || '#0F172A',
        flex: 1,
        marginRight: 8,
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primarySoft || '#FFF7ED',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    distanceText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.primaryDark || '#B45309',
        marginLeft: 2,
    },
    addressRow: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingRight: 16,
    },
    address: {
        fontSize: 13,
        color: COLORS.textLight,
        marginLeft: 4,
        lineHeight: 18,
    },
    tagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    tagText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginRight: 8,
        backgroundColor: COLORS.background || '#F3F4F6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
});