import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';
import { COLORS, SPACING, RADIUS } from '../theme';

export const MyReviewsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const { data: reviews = [], isLoading, refetch } = useQuery({
        queryKey: ['my-reviews'],
        queryFn: async () => {
            const res = await client.get('/reviews/my-reviews');
            return res.data.data || [];
        }
    });

    const renderStars = (rating) => {
        return (
            <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= rating ? '#F59E0B' : COLORS.textLight}
                    />
                ))}
            </View>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{item.Shop?.name || 'Shop'}</Text>
                    <Text style={styles.barberName}>
                        Thợ: {item.Barber?.name || 'Chưa có'}
                    </Text>
                </View>
                <View style={styles.ratingContainer}>
                    {renderStars(item.rating)}
                </View>
            </View>

            <Text style={styles.serviceName}>
                Dịch vụ: {item.Service?.name || 'Cắt tóc'}
            </Text>

            {item.comment && (
                <Text style={styles.comment}>{item.comment}</Text>
            )}

            {item.reply && (
                <View style={styles.replyContainer}>
                    <View style={styles.replyHeader}>
                        <Ionicons name="storefront-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.replyLabel}> Phản hồi từ tiệm:</Text>
                    </View>
                    <Text style={styles.replyText}>{item.reply}</Text>
                    <Text style={styles.replyDate}>
                        {item.repliedAt ? new Date(item.repliedAt).toLocaleDateString('vi-VN') : ''}
                    </Text>
                </View>
            )}

            <View style={styles.reviewFooter}>
                <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
            <Text style={styles.emptyText}>
                Sau khi hoàn thành dịch vụ, bạn có thể để lại đánh giá cho salon
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.title} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
                <View style={styles.backButton} />
            </View>

            <FlatList
                data={reviews}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={refetch}
                ListEmptyComponent={renderEmpty}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.title,
        textAlign: 'center',
    },
    listContent: {
        padding: SPACING.l,
        flexGrow: 1,
    },
    reviewCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        marginBottom: SPACING.m,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.s,
    },
    shopInfo: {
        flex: 1,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.title,
    },
    barberName: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    starsRow: {
        flexDirection: 'row',
    },
    serviceName: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: SPACING.s,
    },
    comment: {
        fontSize: 14,
        color: COLORS.text,
        lineHeight: 20,
        marginBottom: SPACING.s,
        fontStyle: 'italic',
    },
    replyContainer: {
        backgroundColor: COLORS.primarySoft || '#FFF3E0',
        borderRadius: RADIUS.m,
        padding: SPACING.s,
        marginTop: SPACING.s,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    replyLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.primary,
    },
    replyText: {
        fontSize: 13,
        color: COLORS.text,
        lineHeight: 18,
    },
    replyDate: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 4,
    },
    reviewFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginTop: SPACING.m,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: SPACING.s,
        paddingHorizontal: SPACING.l,
    },
});
