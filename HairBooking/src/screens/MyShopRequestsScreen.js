import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';
import { COLORS, SPACING, RADIUS } from '../theme';

export const MyShopRequestsScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const { data: requests = [], isLoading, refetch } = useQuery({
        queryKey: ['my-shop-requests'],
        queryFn: async () => {
            const res = await client.get('/shop-requests/my-requests');
            return res.data || [];
        }
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Đang chờ duyệt',
                    color: COLORS.pending || '#F59E0B',
                    bg: COLORS.pendingBg || '#FEF3C7',
                    icon: 'time-outline'
                };
            case 'approved':
                return {
                    label: 'Đã duyệt',
                    color: COLORS.success || '#10B981',
                    bg: COLORS.successBg || '#D1FAE5',
                    icon: 'checkmark-circle-outline'
                };
            case 'rejected':
                return {
                    label: 'Bị từ chối',
                    color: COLORS.error || '#EF4444',
                    bg: COLORS.errorBg || '#FEE2E2',
                    icon: 'close-circle-outline'
                };
            default:
                return {
                    label: status,
                    color: COLORS.textLight,
                    bg: COLORS.background,
                    icon: 'help-circle-outline'
                };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderItem = ({ item }) => {
        const statusInfo = getStatusInfo(item.status);

        return (
            <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                    <View style={styles.shopInfo}>
                        <Ionicons name="storefront-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.shopName}>{item.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                        <Text style={[styles.statusText, { color: statusInfo.color }]}>
                            {statusInfo.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.requestDetail}>
                    <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{item.address}</Text>
                </View>

                <View style={styles.requestDetail}>
                    <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.detailText}>{item.phone}</Text>
                </View>

                {item.status === 'rejected' && item.rejectReason && (
                    <View style={styles.rejectReason}>
                        <Ionicons name="warning-outline" size={16} color={COLORS.error} />
                        <Text style={styles.rejectReasonText}>
                            Lý do: {item.rejectReason}
                        </Text>
                    </View>
                )}

                <View style={styles.requestFooter}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.dateText}>
                        Ngày gửi: {formatDate(item.createdAt)}
                    </Text>
                </View>

                {item.status === 'approved' && (
                    <TouchableOpacity 
                        style={styles.viewShopButton}
                        onPress={() => {
                            // Navigate to shop detail if needed
                        }}
                    >
                        <Text style={styles.viewShopText}>Xem shop của bạn</Text>
                        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Chưa có yêu cầu nào</Text>
            <Text style={styles.emptyText}>
                Bạn chưa đăng ký shop nào. Hãy đăng ký ngay!
            </Text>
            <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => navigation.navigate('RegisterShop')}
            >
                <Text style={styles.registerButtonText}>Đăng ký shop</Text>
            </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Yêu cầu của tôi</Text>
                <View style={styles.backButton} />
            </View>

            <FlatList
                data={requests}
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
    requestCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        marginBottom: SPACING.m,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    shopName: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.title,
        marginLeft: SPACING.s,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.m,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    requestDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 13,
        color: COLORS.textLight,
        marginLeft: SPACING.s,
        flex: 1,
    },
    rejectReason: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.errorBg || '#FEE2E2',
        padding: SPACING.s,
        borderRadius: RADIUS.s,
        marginTop: SPACING.s,
    },
    rejectReasonText: {
        fontSize: 13,
        color: COLORS.error,
        marginLeft: SPACING.s,
        flex: 1,
    },
    requestFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.s,
        paddingTop: SPACING.s,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 4,
    },
    viewShopButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primarySoft || '#FFF3E0',
        padding: SPACING.s,
        borderRadius: RADIUS.m,
        marginTop: SPACING.m,
    },
    viewShopText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginRight: 4,
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
    registerButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderRadius: RADIUS.m,
        marginTop: SPACING.l,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
