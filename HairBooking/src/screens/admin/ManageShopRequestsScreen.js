import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageShopRequestsScreen = ({ navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const { refreshUser } = useContext(AuthContext);

    const fetchRequests = async () => {
        try {
            const res = await client.get('/admin/shop-requests');
            setRequests(res.data);
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const handleApprove = async (id) => {
        console.log('handleApprove called with id:', id);
        
        // Gọi trực tiếp không qua alert confirm
        try {
            const res = await client.patch(`/admin/shop-requests/${id}/approve`);
            console.log('Success:', res.data);
            Alert.alert('Thành công', 'Shop đã được duyệt');
            fetchRequests();
        } catch (e) {
            console.error('Error:', e);
            Alert.alert('Lỗi', e.response?.data?.message || 'Duyệt thất bại');
        }
    };

    const handleReject = (id) => {
        setSelectedRequestId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const submitReject = async () => {
        if (!rejectReason.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
            return;
        }
        try {
            await client.patch(`/admin/shop-requests/${selectedRequestId}/reject`, { rejectReason });
            Alert.alert('Thành công', 'Yêu cầu đã bị từ chối');
            setShowRejectModal(false);
            fetchRequests();
        } catch (e) {
            Alert.alert('Lỗi', e.response?.data?.message || 'Từ chối thất bại');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return COLORS.warning;
            case 'approved': return COLORS.success;
            case 'rejected': return COLORS.error;
            default: return COLORS.textLight;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt';
            case 'approved': return 'Đã duyệt';
            case 'rejected': return 'Đã từ chối';
            default: return status;
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.shopName}>{item.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
            </View>
            
            <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>{item.address}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>{item.phone}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>{item.email}</Text>
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>{item.openingTime} - {item.closingTime}</Text>
            </View>

            {item.description ? (
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            ) : null}

            {item.status === 'pending' ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => handleReject(item.id)}
                    >
                        <Ionicons name="close" size={18} color={COLORS.surface} />
                        <Text style={styles.buttonText}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, styles.approveButton]}
                        onPress={() => handleApprove(item.id)}
                    >
                        <Ionicons name="checkmark" size={18} color={COLORS.surface} />
                        <Text style={styles.buttonText}>Duyệt</Text>
                    </TouchableOpacity>
                </View>
            ) : null}
        </View>
    );

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Yêu cầu đăng ký shop</Text>
                {pendingCount > 0 ? (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{pendingCount} chờ duyệt</Text>
                    </View>
                ) : null}
            </View>

            <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={60} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>Chưa có yêu cầu nào</Text>
                    </View>
                }
            />

            <Modal visible={showRejectModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Từ chối yêu cầu</Text>
                        <Text style={styles.modalLabel}>Lý do từ chối:</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            placeholder="Nhập lý do từ chối..."
                            multiline
                            numberOfLines={4}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.modalCancelButton} 
                                onPress={() => setShowRejectModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.modalSubmitButton} 
                                onPress={submitReject}
                            >
                                <Text style={styles.modalSubmitText}>Từ chối</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        backgroundColor: COLORS.surface,
    },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.secondary },
    badge: {
        backgroundColor: COLORS.warning,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.m,
    },
    badgeText: { color: COLORS.surface, fontWeight: '600', fontSize: 12 },
    list: { padding: SPACING.m },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        marginBottom: SPACING.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.s,
    },
    shopName: { fontSize: 18, fontWeight: '700', color: COLORS.secondary, flex: 1 },
    statusBadge: {
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.s,
    },
    statusText: { color: COLORS.surface, fontSize: 12, fontWeight: '600' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
    infoText: { marginLeft: SPACING.s, color: COLORS.text, fontSize: 14 },
    description: { marginTop: SPACING.s, color: COLORS.textLight, fontSize: 13 },
    buttonRow: { flexDirection: 'row', marginTop: SPACING.m, gap: SPACING.m },
    button: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.m,
        borderRadius: RADIUS.m,
        gap: SPACING.xs,
    },
    rejectButton: { backgroundColor: COLORS.error },
    approveButton: { backgroundColor: COLORS.success },
    buttonText: { color: COLORS.surface, fontWeight: '600' },
    empty: { alignItems: 'center', marginTop: SPACING.xl * 2 },
    emptyText: { marginTop: SPACING.m, color: COLORS.textLight, fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.l },
    modalContent: { backgroundColor: COLORS.surface, borderRadius: RADIUS.l, padding: SPACING.l },
    modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.m },
    modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: SPACING.s },
    modalInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.s, padding: SPACING.s, minHeight: 100, textAlignVertical: 'top' },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.m, marginTop: SPACING.l },
    modalCancelButton: { paddingVertical: SPACING.s, paddingHorizontal: SPACING.m },
    modalCancelText: { color: COLORS.textLight, fontWeight: '600' },
    modalSubmitButton: { backgroundColor: COLORS.error, paddingVertical: SPACING.s, paddingHorizontal: SPACING.l, borderRadius: RADIUS.s },
    modalSubmitText: { color: COLORS.surface, fontWeight: '600' },
});
