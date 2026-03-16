import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

const STATUS_COLORS = {
    pending: COLORS.warning,
    confirmed: COLORS.primary,
    checked_in: COLORS.info,
    done: COLORS.success,
    cancelled: COLORS.error,
    no_show: COLORS.textLight,
};

const STATUS_LABELS = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    checked_in: 'Đã check-in',
    done: 'Hoàn thành',
    cancelled: 'Đã hủy',
    no_show: 'Không đến',
};

export const ManageBookingsScreen = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            const response = await client.get('/admin/bookings');
            setBookings(response.data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleUpdateStatus = async (booking, newStatus) => {
        try {
            await client.patch(`/bookings/${booking.id}/status`, { status: newStatus });
            Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
            fetchBookings();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
        }
    };

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const filteredBookings = filterStatus === 'all' 
        ? bookings 
        : bookings.filter(b => b.status === filterStatus);

    const getStatusActions = (booking) => {
        const actions = [];
        if (booking.status === 'pending') {
            actions.push({ label: 'Xác nhận', status: 'confirmed', color: COLORS.primary });
            actions.push({ label: 'Hủy', status: 'cancelled', color: COLORS.error });
        }
        if (booking.status === 'confirmed') {
            actions.push({ label: 'Check-in', status: 'checked_in', color: COLORS.info });
            actions.push({ label: 'Hủy', status: 'cancelled', color: COLORS.error });
        }
        if (booking.status === 'checked_in') {
            actions.push({ label: 'Hoàn thành', status: 'done', color: COLORS.success });
        }
        return actions;
    };

    const renderBooking = ({ item }) => {
        const statusColor = STATUS_COLORS[item.status] || COLORS.textLight;
        const statusLabel = STATUS_LABELS[item.status] || item.status;

        return (
            <TouchableOpacity style={styles.bookingCard} onPress={() => handleViewDetail(item)}>
                <View style={styles.bookingHeader}>
                    <View style={styles.bookingInfo}>
                        <Text style={styles.bookingId}>#{item.id}</Text>
                        <Text style={styles.shopName}>{item.Shop?.name || 'Shop'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>{statusLabel}</Text>
                    </View>
                </View>

                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textLight} />
                        <Text style={styles.detailText}>{item.User?.name || 'Khách hàng'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="cut-outline" size={14} color={COLORS.textLight} />
                        <Text style={styles.detailText}>{item.Service?.name || 'Dịch vụ'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="person-outline" size={14} color={COLORS.textLight} />
                        <Text style={styles.detailText}>{item.Barber?.name || 'Chưa chọn thợ'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.textLight} />
                        <Text style={styles.detailText}>
                            {item.booking_date ? new Date(item.booking_date).toLocaleDateString('vi-VN') : ''} - {item.booking_time}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={14} color={COLORS.textLight} />
                        <Text style={styles.detailText}>
                            {item.actual_price ? `${item.actual_price.toLocaleString()}đ` : `${item.original_price?.toLocaleString() || 0}đ`}
                        </Text>
                    </View>
                </View>

                <View style={styles.bookingActions}>
                    {getStatusActions(item).map((action) => (
                        <TouchableOpacity
                            key={action.status}
                            style={[styles.actionButton, { backgroundColor: action.color }]}
                            onPress={() => handleUpdateStatus(item, action.status)}
                        >
                            <Text style={styles.actionButtonText}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Không có lịch hẹn</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                <TouchableOpacity style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]} onPress={() => setFilterStatus('all')}>
                    <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>Tất cả</Text>
                </TouchableOpacity>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <TouchableOpacity key={key} style={[styles.filterButton, filterStatus === key && styles.filterButtonActive]} onPress={() => setFilterStatus(key)}>
                        <Text style={[styles.filterText, filterStatus === key && styles.filterTextActive]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderBooking}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            />

            <Modal visible={showDetailModal} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết lịch hẹn</Text>
                        <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    {selectedBooking && (
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                                <Text style={styles.detailLabel}>Tên: {selectedBooking.User?.name}</Text>
                                <Text style={styles.detailLabel}>Email: {selectedBooking.User?.email}</Text>
                                <Text style={styles.detailLabel}>SĐT: {selectedBooking.User?.phone}</Text>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
                                <Text style={styles.detailLabel}>Mã: #{selectedBooking.id}</Text>
                                <Text style={styles.detailLabel}>Cửa hàng: {selectedBooking.Shop?.name}</Text>
                                <Text style={styles.detailLabel}>Dịch vụ: {selectedBooking.Service?.name}</Text>
                                <Text style={styles.detailLabel}>Thợ: {selectedBooking.Barber?.name || 'Chưa chọn'}</Text>
                                <Text style={styles.detailLabel}>Ngày: {selectedBooking.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString('vi-VN') : ''}</Text>
                                <Text style={styles.detailLabel}>Giờ: {selectedBooking.booking_time}</Text>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.sectionTitle}>Thanh toán</Text>
                                <Text style={styles.detailLabel}>Giá gốc: {selectedBooking.original_price?.toLocaleString() || 0}đ</Text>
                                <Text style={styles.detailLabel}>Giá thực: {selectedBooking.actual_price?.toLocaleString() || 0}đ</Text>
                                <Text style={styles.detailLabel}>Phương thức: {selectedBooking.paymentMethod || 'Tiền mặt'}</Text>
                                <Text style={styles.detailLabel}>Trạng thái: {STATUS_LABELS[selectedBooking.status]}</Text>
                            </View>

                            {selectedBooking.note && (
                                <View style={styles.detailSection}>
                                    <Text style={styles.sectionTitle}>Ghi chú</Text>
                                    <Text style={styles.detailLabel}>{selectedBooking.note}</Text>
                                </View>
                            )}

                            <View style={styles.actionButtons}>
                                {getStatusActions(selectedBooking).map((action) => (
                                    <TouchableOpacity
                                        key={action.status}
                                        style={[styles.modalActionButton, { backgroundColor: action.color }]}
                                        onPress={() => {
                                            handleUpdateStatus(selectedBooking, action.status);
                                            setShowDetailModal(false);
                                        }}
                                    >
                                        <Text style={styles.modalActionText}>{action.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    )}
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    filterContainer: { maxHeight: 50, paddingHorizontal: SPACING.m, paddingVertical: SPACING.s },
    filterButton: { paddingHorizontal: SPACING.m, paddingVertical: SPACING.xs, borderRadius: RADIUS.l, backgroundColor: COLORS.white, marginRight: SPACING.xs },
    filterButtonActive: { backgroundColor: COLORS.primary },
    filterText: { fontSize: 13, color: COLORS.textLight },
    filterTextActive: { color: COLORS.white },
    listContainer: { padding: SPACING.m, flexGrow: 1 },
    bookingCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.s },
    bookingInfo: {},
    bookingId: { fontSize: 12, color: COLORS.textLight },
    shopName: { fontWeight: '600', fontSize: 16 },
    statusBadge: { paddingHorizontal: SPACING.s, paddingVertical: 4, borderRadius: RADIUS.s },
    statusText: { fontSize: 11, color: COLORS.white },
    bookingDetails: { gap: 4, marginBottom: SPACING.s },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    detailText: { fontSize: 13, color: COLORS.textLight },
    bookingActions: { flexDirection: 'row', gap: SPACING.s, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.s },
    actionButton: { flex: 1, paddingVertical: SPACING.xs, borderRadius: RADIUS.s, alignItems: 'center' },
    actionButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.m },
    modalContainer: { flex: 1, backgroundColor: COLORS.white },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.m, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalBody: { padding: SPACING.m },
    detailSection: { marginBottom: SPACING.l },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: SPACING.s, color: COLORS.primary },
    detailLabel: { fontSize: 14, marginBottom: 4, color: COLORS.text },
    actionButtons: { flexDirection: 'row', gap: SPACING.s, marginTop: SPACING.m },
    modalActionButton: { flex: 1, padding: SPACING.m, borderRadius: RADIUS.s, alignItems: 'center' },
    modalActionText: { color: COLORS.white, fontWeight: '600' },
});
