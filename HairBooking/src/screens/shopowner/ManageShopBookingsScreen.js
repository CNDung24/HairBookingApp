import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
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

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.dateTime}>
                    <View style={styles.dateBox}>
                        <Text style={styles.dateText}>{formatDate(item.booking_date)}</Text>
                    </View>
                    <Text style={styles.timeText}>{formatTime(item.booking_time)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.infoText}>
                        {item.User?.name || 'Khách hàng'}
                        {item.User?.phone && ` - ${item.User.phone}`}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="cut-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.infoText}>
                        {item.Service?.name || 'Dịch vụ'}
                        {item.Barber && ` - ${item.Barber.name}`}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="cash-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.infoText}>{formatPrice(item.actual_price || item.original_price)}</Text>
                </View>
            </View>

            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, styles.cancelBtn]}
                        onPress={() => updateMutation.mutate({ id: item.id, status: 'cancelled' })}
                    >
                        <Ionicons name="close" size={16} color={COLORS.error} />
                        <Text style={[styles.actionText, { color: COLORS.error }]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionBtn, styles.confirmBtn]}
                        onPress={() => handleUpdateStatus(item.id, item.status)}
                    >
                        <Ionicons name="checkmark" size={16} color={COLORS.surface} />
                        <Text style={styles.actionText}>Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'confirmed' && (
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.completeBtn, { alignSelf: 'flex-start' }]}
                    onPress={() => handleUpdateStatus(item.id, item.status)}
                >
                    <Ionicons name="checkmark-done" size={16} color={COLORS.surface} />
                    <Text style={styles.actionText}>Check-in & Hoàn thành</Text>
                </TouchableOpacity>
            )}
        </View>
    );

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
    container: { flex: 1, backgroundColor: COLORS.background },
    filterRow: { flexDirection: 'row', padding: SPACING.m, gap: SPACING.s },
    filterBtn: { paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, borderRadius: RADIUS.m, backgroundColor: COLORS.surface },
    filterBtnActive: { backgroundColor: COLORS.primary },
    filterText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
    filterTextActive: { color: COLORS.surface },
    list: { padding: SPACING.m, paddingTop: 0 },
    card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dateTime: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s },
    dateBox: { backgroundColor: COLORS.primary + '15', paddingHorizontal: SPACING.s, paddingVertical: 4, borderRadius: 4 },
    dateText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
    timeText: { fontSize: 15, fontWeight: '700', color: COLORS.title },
    statusBadge: { paddingHorizontal: SPACING.s, paddingVertical: 4, borderRadius: 4 },
    statusText: { fontSize: 11, color: COLORS.surface, fontWeight: '600' },
    infoSection: { marginTop: SPACING.m, paddingTop: SPACING.m, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
    infoText: { fontSize: 14, color: COLORS.text, marginLeft: SPACING.s },
    actions: { flexDirection: 'row', marginTop: SPACING.m, gap: SPACING.m },
    actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.s, borderRadius: RADIUS.m, gap: 4 },
    cancelBtn: { borderWidth: 1, borderColor: COLORS.error },
    confirmBtn: { backgroundColor: COLORS.primary },
    completeBtn: { backgroundColor: COLORS.success, marginTop: SPACING.m },
    actionText: { fontSize: 14, fontWeight: '600', color: COLORS.surface },
    empty: { alignItems: 'center', marginTop: SPACING.xl * 2 },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.m },
});
