import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOW } from '../theme';
import { Ionicons as Icon } from '@expo/vector-icons';

export const ShopCard = ({
    shop,
    onPress,
    onFavoritePress // Callback khi bấm nút tim
}) => {
    // Giả lập dữ liệu nếu thiếu
    const distance = shop.distance || '1.2 km';
    const isOpen = shop.isOpen ?? true; // Mặc định là mở
    const rating = shop.rating || 4.8;
    const reviewCount = shop.reviewCount || 120;

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

                {/* Button: Favorite (Góc phải trên) */}
                <TouchableOpacity
                    style={styles.favoriteBtn}
                    onPress={onFavoritePress}
                    activeOpacity={0.7}
                >
                    <Icon name="heart-outline" size={20} color="#FFF" />
                </TouchableOpacity>

                {/* Badge: Status (Góc trái dưới của ảnh - Tùy chọn) */}
                {isOpen && (
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Đang mở</Text>
                    </View>
                )}
            </View>

            {/* --- CONTENT SECTION --- */}
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
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
        borderRadius: RADIUS.l, // Bo góc lớn (24px)
        marginBottom: SPACING.m + 4,
        ...SHADOW, // Bóng đổ từ theme
        // Đảm bảo shadow hiện đẹp trên Android khi overflow hidden
        borderWidth: 1,
        borderColor: COLORS.border || '#F3F4F6',
    },
    imageContainer: {
        height: 180, // Ảnh cao hơn chút để immersive
        width: '100%',
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
        overflow: 'hidden', // Để cắt ảnh theo bo góc
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },

    // --- FLOATING ELEMENTS ---
    ratingBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Nền trắng mờ
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
    favoriteBtn: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.3)', // Nền đen mờ
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5', // Xanh lá rất nhạt
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.s,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.success || '#10B981',
        marginRight: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.success || '#10B981',
        textTransform: 'uppercase',
    },

    // --- CONTENT STYLES ---
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
        paddingRight: 16, // Tránh chữ tràn sát mép
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
    },
    tagText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginRight: 8,
        backgroundColor: COLORS.background || '#F3F4F6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    }
});