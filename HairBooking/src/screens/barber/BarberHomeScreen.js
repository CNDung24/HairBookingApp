// File: g:\hair-booking\HairBooking\src\screens\barber\BarberHomeScreen.js
import React, { useState, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, Alert,
    TouchableOpacity, StatusBar, ActivityIndicator, Linking, RefreshControl
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import moment from 'moment';

import client from '../../api/client';
import { COLORS, SPACING, RADIUS, SHADOW, SHADOWS } from '../../theme';
import { Button } from '../../components/Button';

// --- HELPER COMPONENTS ---

// 1. Badge Trạng Thái (Theo quy trình 5 bước)
const StatusBadge = ({ status }) => {
    let color, bg, label, icon;

    switch (status) {
        case 'pending':
            color = '#D97706'; bg = '#FFFBEB'; label = 'Chờ duyệt'; icon = 'time-outline'; break;
        case 'confirmed':
            color = '#2563EB'; bg = '#EFF6FF'; label = 'Đã xác nhận'; icon = 'checkmark-circle-outline'; break;
        case 'checked_in':
            color = '#7C3AED'; bg = '#F5F3FF'; label = 'Khách đã đến'; icon = 'body-outline'; break;
        case 'done':
            color = '#059669'; bg = '#ECFDF5'; label = 'Hoàn thành'; icon = 'star'; break;
        case 'cancelled':
            color = '#DC2626'; bg = '#FEF2F2'; label = 'Đã hủy'; icon = 'close-circle-outline'; break;
        default:
            color = COLORS.textLight; bg = '#F3F4F6'; label = status; icon = 'help-circle-outline';
    }

    return (
        <View style={[styles.badge, { backgroundColor: bg }]}>
            <Icon name={icon} size={12} color={color} style={{ marginRight: 4 }} />
            <Text style={[styles.badgeText, { color }]}>{label.toUpperCase()}</Text>
        </View>
    );
};

// 2. Date Strip (Thanh chọn ngày ngang)
const DateStrip = ({ selectedDate, onSelect }) => {
    const days = useMemo(() => {
        const result = [];
        for (let i = -2; i < 7; i++) { // Xem được 2 ngày trước và 7 ngày tới
            result.push(moment().add(i, 'days'));
        }
        return result;
    }, []);

    return (
        <View style={styles.dateStripContainer}>
            <FlatList
                horizontal
                data={days}
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.format('YYYY-MM-DD')}
                contentContainerStyle={{ paddingHorizontal: SPACING.l }}
                renderItem={({ item }) => {
                    const dateStr = item.format('YYYY-MM-DD');
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === moment().format('YYYY-MM-DD');
                    return (
                        <TouchableOpacity
                            style={[styles.dateItem, isSelected && styles.dateItemActive]}
                            onPress={() => onSelect(dateStr)}
                        >
                            <Text style={[styles.dateDay, isSelected && styles.dateTextActive]}>
                                {isToday ? 'H.Nay' : item.format('ddd')}
                            </Text>
                            <Text style={[styles.dateNum, isSelected && styles.dateTextActive]}>
                                {item.format('DD')}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

// --- MAIN SCREEN ---

export const BarberHomeScreen = ({ navigation }) => {
    const queryClient = useQueryClient();
    const insets = useSafeAreaInsets();
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

    // 1. Lấy danh sách lịch hẹn
    const { data: appointments, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['barber-appointments'],
        queryFn: async () => {
            const res = await client.get('/bookings/barber');
            return res.data;
        }
    });

    // 2. Lọc dữ liệu theo ngày
    const filteredAppointments = useMemo(() => {
        if (!appointments) return [];
        return appointments.filter(item => item.booking_date === selectedDate);
    }, [appointments, selectedDate]);

    // 3. Mutation Cập nhật trạng thái (Xác nhận, Check-in, Hoàn thành)
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, actual_price }) => {
            return await client.patch(`/bookings/${id}/status`, { status, actual_price });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['barber-appointments']);
        },
        onError: (err) => {
            Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật trạng thái');
        }
    });

    const handleCall = (phone) => {
        if (phone) Linking.openURL(`tel:${phone}`);
        else Alert.alert('Thông báo', 'Khách hàng không cung cấp số điện thoại');
    };

    // Hàm xử lý Hoàn tất & Thu tiền (Bước 5)
    const handleComplete = (item) => {
        Alert.alert(
            'Hoàn tất dịch vụ',
            `Tổng tiền dự kiến: ${item.Service?.price.toLocaleString()}đ. Bạn có muốn thay đổi giá thực tế không?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Giữ giá cũ',
                    onPress: () => updateStatusMutation.mutate({
                        id: item.id,
                        status: 'done',
                        actual_price: item.Service?.price
                    })
                },
                // Lưu ý: Prompt nhập giá tùy chỉnh thường dùng Modal riêng, ở đây ta làm đơn giản
            ]
        );
    };

    // 4. Render Card Lịch Hẹn
    const renderItem = ({ item }) => {
        const status = item.status;

        return (
            <View style={styles.card}>
                {/* Row 1: Time & Status */}
                <View style={styles.cardHeader}>
                    <View style={styles.timeTag}>
                        <Icon name="time-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.timeText}>{item.booking_time.substring(0, 5)}</Text>
                    </View>
                    <StatusBadge status={status} />
                </View>

                {/* Row 2: Customer Info */}
                <View style={styles.customerRow}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{item.User?.name?.charAt(0) || 'K'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.customerName}>{item.User?.name || 'Khách vãng lai'}</Text>
                        <Text style={styles.serviceName}>
                            <Icon name="cut-outline" size={12} /> {item.Service?.name || 'Dịch vụ'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(item.User?.phone)}>
                        <Icon name="call" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Row 3: Action Buttons (Dựa trên quy trình) */}
                <View style={styles.actionRow}>
                    {status === 'pending' && (
                        <>
                            <Button
                                title="Từ chối"
                                variant="ghost"
                                style={{ flex: 1, marginRight: 8 }}
                                textStyle={{ color: COLORS.error }}
                                onPress={() => updateStatusMutation.mutate({ id: item.id, status: 'cancelled' })}
                            />
                            <Button
                                title="Xác nhận"
                                style={{ flex: 1.5 }}
                                onPress={() => updateStatusMutation.mutate({ id: item.id, status: 'confirmed' })}
                            />
                        </>
                    )}

                    {status === 'confirmed' && (
                        <Button
                            title="Khách đã đến (Check-in)"
                            variant="secondary"
                            style={{ flex: 1 }}
                            icon="log-in-outline"
                            onPress={() => updateStatusMutation.mutate({ id: item.id, status: 'checked_in' })}
                        />
                    )}

                    {status === 'checked_in' && (
                        <Button
                            title="Hoàn thành & Thu tiền"
                            style={{ flex: 1, backgroundColor: COLORS.success }}
                            icon="cash-outline"
                            onPress={() => handleComplete(item)}
                        />
                    )}

                    {(status === 'done' || status === 'cancelled') && (
                        <View style={styles.completedInfo}>
                            <Icon
                                name={status === 'done' ? "checkmark-done" : "close-circle"}
                                size={16}
                                color={status === 'done' ? COLORS.success : COLORS.error}
                            />
                            <Text style={[styles.historyText, { color: status === 'done' ? COLORS.success : COLORS.error }]}>
                                {status === 'done' ? `Đã thu: ${item.actual_price?.toLocaleString()}đ` : 'Lịch hẹn đã bị hủy'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Lịch làm việc ✂️</Text>
                    <Text style={styles.title}>
                        {moment(selectedDate).format('DD [Tháng] MM, YYYY')}
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={styles.refreshBtn} onPress={() => navigation.navigate('BarberSchedule')}>
                        <Icon name="calendar" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.refreshBtn} onPress={refetch}>
                        <Icon name="refresh" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Thanh chọn ngày */}
            <DateStrip selectedDate={selectedDate} onSelect={setSelectedDate} />

            {/* Danh sách lịch hẹn */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredAppointments}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="calendar-outline" size={80} color="#E5E7EB" />
                            <Text style={styles.emptyText}>Không có lịch hẹn nào trong ngày này</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.l, paddingVertical: SPACING.m,
    },
    greeting: { fontSize: 14, color: COLORS.textLight, fontWeight: '600' },
    title: { fontSize: 20, fontWeight: '800', color: COLORS.title },
    refreshBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF',
        justifyContent: 'center', alignItems: 'center', ...SHADOWS.small
    },

    // Date Strip
    dateStripContainer: { marginBottom: SPACING.m },
    dateItem: {
        width: 65, height: 75, backgroundColor: '#FFF', marginRight: 12,
        borderRadius: RADIUS.m, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.small
    },
    dateItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    dateDay: { fontSize: 11, color: COLORS.textLight, marginBottom: 4, textTransform: 'uppercase' },
    dateNum: { fontSize: 20, fontWeight: '800', color: COLORS.title },
    dateTextActive: { color: '#FFF' },

    // List & Card
    listContent: { padding: SPACING.l, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFF', borderRadius: RADIUS.l, padding: SPACING.m,
        marginBottom: SPACING.m, ...SHADOWS.card, borderWidth: 1, borderColor: '#F1F5F9'
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    timeTag: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.s,
    },
    timeText: { marginLeft: 6, fontWeight: '800', color: COLORS.title, fontSize: 15 },

    badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 10, fontWeight: '800' },

    // Customer
    customerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    avatarPlaceholder: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primarySoft,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF'
    },
    avatarText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    customerName: { fontSize: 16, fontWeight: '700', color: COLORS.title },
    serviceName: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
    callBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.success,
        justifyContent: 'center', alignItems: 'center', ...SHADOWS.small
    },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },

    // Actions
    actionRow: { flexDirection: 'row', alignItems: 'center' },
    completedInfo: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8 },
    historyText: { marginLeft: 8, fontWeight: '700', fontSize: 14 },

    // Empty
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 80, opacity: 0.5 },
    emptyText: { marginTop: 15, color: COLORS.textLight, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});