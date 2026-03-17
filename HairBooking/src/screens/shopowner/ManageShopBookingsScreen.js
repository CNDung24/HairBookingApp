import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageShopBookingsScreen = ({ navigation }) => {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('all');

    const { data: bookings, isLoading } = useQuery({
        queryKey: ['shopBookings', filter],
        queryFn: async () => {
            const res = await client.get(`/shop-owner/bookings?status=${filter}`);
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, status }) => client.patch(`/shop-owner/bookings/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['shopBookings']);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Cập nhật thất bại');
        }
    });

    const onRefresh = async () => {
        setRefreshing(true);
        queryClient.invalidateQueries(['shopBookings']);
        setRefreshing(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    const formatTime = (time) => {
        return time ? time.substring(0, 5) : '';
    };

    const formatPrice = (price) => {
        if (!price) return 'Chưa thanh toán';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return COLORS.warning;
            case 'confirmed': return COLORS.primary;
            case 'checked_in': return '#8B5CF6';
            case 'done': return COLORS.success;
            case 'cancelled': return COLORS.error;
            case 'no_show': return COLORS.textLight;
            default: return COLORS.textLight;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'confirmed': return 'Đã xác nhận';
            case 'checked_in': return 'Đã check-in';
            case 'done': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            case 'no_show': return 'Không đến';
            default: return status;
        }
    };

    const handleUpdateStatus = (id, currentStatus) => {
        const nextStatus = {
            'pending': 'confirmed',
            'confirmed': 'checked_in',
            'checked_in': 'done',
        };

        if (nextStatus[currentStatus]) {
            updateMutation.mutate({ id, status: nextStatus[currentStatus] });
        }
    };

    const filters = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xác nhận' },
        { key: 'confirmed', label: 'Đã xác nhận' },
        { key: 'done', label: 'Hoàn thành' },
    ];

    const renderItem = ({ item }) => {
        const statusColor = getStatusColor(item.status);
        const statusLabel = getStatusText(item.status);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.timeSection}>
                        <View style={[styles.timeIcon, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name="time" size={18} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.timeLabel}>{formatTime(item.booking_time)}</Text>
                            <Text style={styles.dateLabel}>{formatDate(item.booking_date)}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                        <View style={styles.infoLabelGroup}>
                            <Text style={styles.infoTextMain}>{item.User?.name || 'Khách hàng'}</Text>
                            {item.User?.phone && <Text style={styles.infoTextSub}>{item.User.phone}</Text>}
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cut-outline" size={16} color={COLORS.textLight} />
                        <View style={styles.infoLabelGroup}>
                            <Text style={styles.infoTextMain}>{item.Service?.name || 'Dịch vụ'}</Text>
                            {item.Barber && <Text style={styles.infoTextSub}>Barber: {item.Barber.name}</Text>}
                        </View>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.priceSection}>
                        <Text style={styles.priceLabel}>Tổng tiền</Text>
                        <Text style={styles.priceValue}>{formatPrice(item.actual_price || item.original_price)}</Text>
                    </View>

                    <View style={styles.actions}>
                        {item.status === 'pending' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.miniActionBtn, styles.cancelBtn]}
                                    onPress={() => updateMutation.mutate({ id: item.id, status: 'cancelled' })}
                                >
                                    <Ionicons name="close" size={18} color={COLORS.error} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.miniActionBtn, styles.confirmBtn]}
                                    onPress={() => handleUpdateStatus(item.id, item.status)}
                                >
                                    <Ionicons name="checkmark" size={18} color={COLORS.white} />
                                </TouchableOpacity>
                            </>
                        )}

                        {item.status === 'confirmed' && (
                            <TouchableOpacity
                                style={[styles.wideActionBtn, styles.completeBtn]}
                                onPress={() => handleUpdateStatus(item.id, item.status)}
                            >
                                <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
                                <Text style={styles.actionText}>Hoàn thành</Text>
                            </TouchableOpacity>
                        )}
                        
                        {(item.status === 'done' || item.status === 'cancelled' || item.status === 'checked_in') && (
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} style={{ marginLeft: 8 }} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterRow}>
                {filters.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={bookings || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="calendar-outline" size={60} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>Không có lịch hẹn</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        ...(Platform.OS === 'web' && {
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
        }),
    },
    filterRow: { 
        flexDirection: 'row', 
        paddingHorizontal: SPACING.m, 
        paddingVertical: SPACING.s, 
        gap: SPACING.s,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filterBtn: { 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: RADIUS.m, 
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterBtnActive: { 
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    filterText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
    filterTextActive: { color: COLORS.primary },
    
    list: { padding: SPACING.m, paddingBottom: 40 },
    
    // Premium Card
    card: { 
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.l, 
        padding: SPACING.m, 
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 }
        })
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: SPACING.m 
    },
    timeSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    timeIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    timeLabel: { fontSize: 16, fontWeight: '800', color: COLORS.title },
    dateLabel: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
    
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 20 
    },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontWeight: '700' },
    
    divider: { height: 1, backgroundColor: '#F8FAFC', marginBottom: SPACING.m },
    
    infoSection: { gap: 12, marginBottom: SPACING.m },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoLabelGroup: { flex: 1 },
    infoTextMain: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    infoTextSub: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    
    cardFooter: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: RADIUS.m,
        marginHorizontal: -4,
    },
    priceSection: { gap: 2 },
    priceLabel: { fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase' },
    priceValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
    
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    miniActionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    wideActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: RADIUS.m,
        gap: 6,
        elevation: 2,
    },
    cancelBtn: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.error, elevation: 0 },
    confirmBtn: { backgroundColor: COLORS.primary },
    completeBtn: { backgroundColor: COLORS.success },
    actionText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
    
    empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xl * 2 },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.m },
});
