import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Image, TextInput, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageShopsScreen = () => {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedShop, setSelectedShop] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', address: '', phone: '', email: '', city: '', description: '' });

    const fetchShops = async () => {
        try {
            const response = await client.get('/admin/shops');
            setShops(response.data || []);
        } catch (error) {
            console.error('Error fetching shops:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách cửa hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchShops();
    };

    const handleEdit = (shop) => {
        setSelectedShop(shop);
        setEditForm({
            name: shop.name || '',
            address: shop.address || '',
            phone: shop.phone || '',
            email: shop.email || '',
            city: shop.city || '',
            description: shop.description || '',
        });
        setShowEditModal(true);
    };

    const handleSave = async () => {
        try {
            await client.put(`/shops/${selectedShop.id}`, editForm);
            Alert.alert('Thành công', 'Cập nhật cửa hàng thành công');
            setShowEditModal(false);
            fetchShops();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật cửa hàng');
        }
    };

    const handleDelete = (shop) => {
        Alert.alert('Xác nhận', `Bạn có chắc muốn xóa cửa hàng "${shop.name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/shops/${shop.id}`);
                        Alert.alert('Thành công', 'Xóa cửa hàng thành công');
                        fetchShops();
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa cửa hàng');
                    }
                },
            },
        ]);
    };

    const filteredShops = shops.filter(shop =>
        shop.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        shop.city?.toLowerCase().includes(searchText.toLowerCase()) ||
        shop.address?.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderShop = ({ item }) => (
        <View style={styles.shopCard}>
            <View style={styles.shopHeader}>
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.shopImage} />
                ) : (
                    <View style={[styles.shopImage, styles.shopImagePlaceholder]}>
                        <Ionicons name="storefront" size={24} color={COLORS.textLight} />
                    </View>
                )}
                <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{item.name}</Text>
                    <View style={styles.shopLocation}>
                        <Ionicons name="location-outline" size={14} color={COLORS.textLight} />
                        <Text style={styles.shopAddress}>{item.address}, {item.city}</Text>
                    </View>
                    <View style={styles.shopContact}>
                        <Ionicons name="call-outline" size={14} color={COLORS.textLight} />
                        <Text style={styles.shopPhone}>{item.phone}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, item.isActive && styles.activeBadge]}>
                    <Text style={styles.statusText}>{item.isActive ? 'Hoạt động' : 'Tắt'}</Text>
                </View>
            </View>
            
            <View style={styles.shopStats}>
                <View style={styles.statItem}>
                    <Ionicons name="star" size={14} color={COLORS.warning} />
                    <Text style={styles.statText}>{item.rating?.toFixed(1) || '0.0'}</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="people" size={14} color={COLORS.primary} />
                    <Text style={styles.statText}>{item.totalBookings || 0} bookings</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="cut" size={14} color={COLORS.textLight} />
                    <Text style={styles.statText}>{item.totalBarbers || 0} thợ</Text>
                </View>
            </View>

            <View style={styles.shopActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                    <Ionicons name="pencil" size={16} color={COLORS.primary} />
                    <Text style={styles.editButtonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash" size={16} color={COLORS.error} />
                    <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Không tìm thấy cửa hàng</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm cửa hàng..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            <FlatList
                data={filteredShops}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderShop}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            />

            <Modal visible={showEditModal} animationType="slide" transparent keyboardShouldPersistTaps="handled">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chỉnh sửa cửa hàng</Text>
                        <TouchableOpacity onPress={() => setShowEditModal(false)}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalBody}>
                        <Text style={styles.label}>Tên cửa hàng</Text>
                        <TextInput style={styles.input} value={editForm.name} onChangeText={(text) => setEditForm({ ...editForm, name: text })} />

                        <Text style={styles.label}>Địa chỉ</Text>
                        <TextInput style={styles.input} value={editForm.address} onChangeText={(text) => setEditForm({ ...editForm, address: text })} />

                        <Text style={styles.label}>Thành phố</Text>
                        <TextInput style={styles.input} value={editForm.city} onChangeText={(text) => setEditForm({ ...editForm, city: text })} />

                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput style={styles.input} value={editForm.phone} onChangeText={(text) => setEditForm({ ...editForm, phone: text })} keyboardType="phone-pad" />

                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} value={editForm.email} onChangeText={(text) => setEditForm({ ...editForm, email: text })} keyboardType="email-address" />

                        <Text style={styles.label}>Mô tả</Text>
                        <TextInput style={[styles.input, styles.textArea]} value={editForm.description} onChangeText={(text) => setEditForm({ ...editForm, description: text })} multiline />

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                        </TouchableOpacity>
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
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, margin: SPACING.m, padding: SPACING.s, borderRadius: RADIUS.s, gap: SPACING.s },
    searchInput: { flex: 1, fontSize: 14 },
    listContainer: { padding: SPACING.m, paddingTop: 0, flexGrow: 1 },
    shopCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m },
    shopHeader: { flexDirection: 'row', gap: SPACING.m },
    shopImage: { width: 70, height: 70, borderRadius: RADIUS.s },
    shopImagePlaceholder: { backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    shopInfo: { flex: 1 },
    shopName: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
    shopLocation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    shopAddress: { fontSize: 13, color: COLORS.textLight, flex: 1 },
    shopContact: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    shopPhone: { fontSize: 13, color: COLORS.textLight },
    statusBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: SPACING.s, paddingVertical: 4, borderRadius: RADIUS.s, backgroundColor: COLORS.textLight },
    activeBadge: { backgroundColor: COLORS.success },
    statusText: { fontSize: 11, color: COLORS.white },
    shopStats: { flexDirection: 'row', gap: SPACING.l, marginTop: SPACING.m, paddingTop: SPACING.s, borderTopWidth: 1, borderTopColor: COLORS.border },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 13, color: COLORS.textLight },
    shopActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.m, marginTop: SPACING.s },
    editButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    editButtonText: { color: COLORS.primary },
    deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    deleteButtonText: { color: COLORS.error },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.m },
    modalContainer: { flex: 1, backgroundColor: COLORS.white },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.m, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalBody: { padding: SPACING.m },
    label: { fontSize: 14, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.m },
    input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.s, padding: SPACING.s, fontSize: 14 },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    saveButton: { backgroundColor: COLORS.primary, padding: SPACING.m, borderRadius: RADIUS.s, alignItems: 'center', marginTop: SPACING.l },
    saveButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});
