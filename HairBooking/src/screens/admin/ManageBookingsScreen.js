import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, ScrollView, Platform } from 'react-native';
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
            <TouchableOpacity 
                style={styles.bookingCard} 
                onPress={() => handleViewDetail(item)}
                activeOpacity={0.8}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.shopSection}>
                        <View style={[styles.shopIcon, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name="business" size={18} color={COLORS.primary} />
                        </View>
                        <View>
                            <Text style={styles.shopName}>{item.Shop?.name || 'Cửa hàng'}</Text>
                            <Text style={styles.bookingId}>Mã đơn: #{item.id}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.infoLabel}>Khách hàng:</Text>
                        <Text style={styles.infoValue}>{item.User?.name || 'Khách vãng lai'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="cut-outline" size={16} color={COLORS.textLight} />
                        <Text style={styles.infoLabel}>Dịch vụ:</Text>
                        <Text style={styles.infoValue}>{item.Service?.name || 'Dịch vụ'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.dateTimeRow}>
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
                                <Text style={styles.infoValue}>
                                    {item.booking_date ? new Date(item.booking_date).toLocaleDateString('vi-VN') : ''}
                                </Text>
                            </View>
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                                <Text style={styles.infoValue}>{item.booking_time}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.priceSection}>
                        <Text style={styles.priceLabel}>Thanh toán</Text>
                        <Text style={styles.priceValue}>
                            {item.actual_price ? `${item.actual_price.toLocaleString()}đ` : `${item.original_price?.toLocaleString() || 0}đ`}
                        </Text>
                    </View>
                    
                    <View style={styles.actionGroup}>
                        {getStatusActions(item).slice(0, 1).map((action) => (
                            <TouchableOpacity
                                key={action.status}
                                style={[styles.miniButton, { backgroundColor: action.color }]}
                                onPress={() => handleUpdateStatus(item, action.status)}
                            >
                                <Text style={styles.miniButtonText}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.detailBtn} onPress={() => handleViewDetail(item)}>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                        </TouchableOpacity>
                    </View>
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

            <Modal visible={showDetailModal} animationType="fade" transparent statusBarTranslucent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Chi tiết lịch hẹn</Text>
                                <Text style={styles.modalSubtitle}>Mã đơn hàng: #{selectedBooking?.id}</Text>
                            </View>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDetailModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedBooking && (
                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                {/* Trạng thái hiện tại */}
                                <View style={[styles.statusBanner, { backgroundColor: STATUS_COLORS[selectedBooking.status] + '15' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[selectedBooking.status] }]} />
                                    <Text style={[styles.statusBannerText, { color: STATUS_COLORS[selectedBooking.status] }]}>
                                        {STATUS_LABELS[selectedBooking.status]}
                                    </Text>
                                </View>

                                {/* Section: Khách hàng & Cửa hàng */}
                                <View style={styles.detailCard}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="person" size={18} color={COLORS.primary} />
                                        <Text style={styles.sectionTitle}>Thông tin đối tác</Text>
                                    </View>
                                    
                                    <View style={styles.infoRowMain}>
                                        <View style={styles.infoLabelGroup}>
                                            <Text style={styles.infoLabel}>Khách hàng</Text>
                                            <Text style={styles.infoValue}>{selectedBooking.User?.name}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.actionIconBtn} onPress={() => {}}>
                                            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.dividerLight} />

                                    <View style={styles.infoRowMain}>
                                        <View style={styles.infoLabelGroup}>
                                            <Text style={styles.infoLabel}>Cửa hàng</Text>
                                            <Text style={styles.infoValue}>{selectedBooking.Shop?.name}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Section: Lịch hẹn */}
                                <View style={styles.detailCard}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="calendar" size={18} color={COLORS.primary} />
                                        <Text style={styles.sectionTitle}>Chi tiết dịch vụ</Text>
                                    </View>

                                    <View style={styles.gridContainer}>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.infoLabel}>Dịch vụ</Text>
                                            <Text style={styles.infoValueSmall}>{selectedBooking.Service?.name}</Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.infoLabel}>Thợ cắt</Text>
                                            <Text style={styles.infoValueSmall}>{selectedBooking.Barber?.name || 'Ngẫu nhiên'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.gridContainer}>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.infoLabel}>Ngày</Text>
                                            <Text style={styles.infoValueSmall}>
                                                {selectedBooking.booking_date ? new Date(selectedBooking.booking_date).toLocaleDateString('vi-VN') : ''}
                                            </Text>
                                        </View>
                                        <View style={styles.gridItem}>
                                            <Text style={styles.infoLabel}>Giờ</Text>
                                            <Text style={styles.infoValueSmall}>{selectedBooking.booking_time}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Section: Thanh toán */}
                                <View style={styles.detailCard}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="wallet" size={18} color={COLORS.primary} />
                                        <Text style={styles.sectionTitle}>Thanh toán</Text>
                                    </View>
                                    
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceLabel}>Giá gốc</Text>
                                        <Text style={styles.priceValueOld}>{selectedBooking.original_price?.toLocaleString()}đ</Text>
                                    </View>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceLabel}>Giá thực tế</Text>
                                        <Text style={styles.priceValueTotal}>{selectedBooking.actual_price?.toLocaleString() || selectedBooking.original_price?.toLocaleString()}đ</Text>
                                    </View>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceLabel}>Phương thức</Text>
                                        <Text style={styles.paymentMethod}>{selectedBooking.paymentMethod || 'Tiền mặt'}</Text>
                                    </View>
                                </View>

                                {selectedBooking.note && (
                                    <View style={styles.detailCard}>
                                        <Text style={styles.sectionTitle}>Ghi chú từ khách</Text>
                                        <Text style={styles.noteText}>{selectedBooking.note}</Text>
                                    </View>
                                )}

                                <View style={styles.modalActions}>
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
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
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
    filterContainer: { 
        maxHeight: 60, 
        paddingHorizontal: SPACING.m, 
        paddingVertical: SPACING.s,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    filterButton: { 
        paddingHorizontal: 16, 
        paddingVertical: 8, 
        borderRadius: RADIUS.m, 
        backgroundColor: '#F3F4F6', 
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterButtonActive: { 
        backgroundColor: COLORS.primary + '15',
        borderColor: COLORS.primary,
    },
    filterText: { fontSize: 13, color: COLORS.textLight, fontWeight: '600' },
    filterTextActive: { color: COLORS.primary },
    
    listContainer: { padding: SPACING.m, paddingBottom: 40 },
    
    // Modern Booking Card
    bookingCard: { 
        backgroundColor: COLORS.white, 
        borderRadius: RADIUS.l, 
        padding: SPACING.m, 
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
            android: { elevation: 3 },
            web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
        })
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: SPACING.m 
    },
    shopSection: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    shopIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    shopName: { fontSize: 16, fontWeight: '800', color: COLORS.title },
    bookingId: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
    
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
    
    cardBody: { gap: 12, marginBottom: SPACING.m },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoLabel: { fontSize: 13, color: COLORS.textLight, width: 85 },
    infoValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
    dateTimeRow: { flexDirection: 'row', gap: 16 },
    dateTimeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    
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
    
    actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    miniButton: { 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 8,
        elevation: 1,
    },
    miniButtonText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
    detailBtn: { padding: 4 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.m },

    // Modal Styles Enhanced
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Platform.OS === 'web' ? 40 : 0,
    },
    modalContainer: {
        flex: 1,
        width: '100%',
        maxWidth: 600,
        backgroundColor: COLORS.background,
        borderRadius: Platform.OS === 'web' ? RADIUS.l : 0,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.title },
    modalSubtitle: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: { padding: SPACING.m },
    statusBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusBannerText: { fontSize: 14, fontWeight: '700' },
    detailCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
        gap: 8,
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.title },
    infoRowMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    infoLabelGroup: { flex: 1 },
    infoLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: '600', color: COLORS.text },
    infoValueSmall: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    actionIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary + '10',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dividerLight: { height: 1, backgroundColor: '#F8FAFC', marginVertical: 12 },
    gridContainer: { flexDirection: 'row', gap: SPACING.m, marginBottom: 12 },
    gridItem: { flex: 1 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    priceLabel: { fontSize: 14, color: COLORS.textLight },
    priceValueOld: { fontSize: 14, color: COLORS.textLight, textDecorationLine: 'line-through' },
    priceValueTotal: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
    paymentMethod: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    noteText: { fontSize: 14, color: COLORS.text, fontStyle: 'italic', lineHeight: 20 },
    modalActions: { flexDirection: 'row', gap: SPACING.m, marginTop: SPACING.s },
    modalActionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: RADIUS.m,
        alignItems: 'center',
        elevation: 2,
    },
    modalActionText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
