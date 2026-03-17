import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, TextInput, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageUsersScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', role: '' });

    const fetchUsers = async () => {
        try {
            const response = await client.get('/admin/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'customer',
        });
        setShowEditModal(true);
    };

    const handleSave = async () => {
        try {
            await client.put(`/admin/users/${selectedUser.id}`, editForm);
            Alert.alert('Thành công', 'Cập nhật người dùng thành công');
            setShowEditModal(false);
            fetchUsers();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật người dùng');
        }
    };

    const handleDelete = (user) => {
        Alert.alert('Xác nhận', `Bạn có chắc muốn xóa user "${user.name}"?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await client.delete(`/admin/users/${user.id}`);
                        Alert.alert('Thành công', 'Xóa người dùng thành công');
                        fetchUsers();
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa người dùng');
                    }
                },
            },
        ]);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
    );

    const getRoleBadge = (role) => {
        const roleConfig = {
            admin: { color: COLORS.error, label: 'Admin' },
            shop_owner: { color: COLORS.primary, label: 'Shop Owner' },
            barber: { color: COLORS.warning, label: 'Barber' },
            customer: { color: COLORS.success, label: 'Customer' },
        };
        const config = roleConfig[role] || roleConfig.customer;
        return (
            <View style={[styles.roleBadge, { backgroundColor: config.color }]}>
                <Text style={styles.roleText}>{config.label}</Text>
            </View>
        );
    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
                </View>
            </View>
            <View style={styles.userActions}>
                {getRoleBadge(item.role)}
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                    <Ionicons name="pencil" size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash" size={18} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm người dùng..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderUser}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            />

            <Modal visible={showEditModal} animationType="slide" transparent keyboardShouldPersistTaps="handled">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chỉnh sửa người dùng</Text>
                        
                        <Text style={styles.label}>Tên</Text>
                        <TextInput
                            style={styles.input}
                            value={editForm.name}
                            onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={editForm.email}
                            onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                            keyboardType="email-address"
                        />

                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput
                            style={styles.input}
                            value={editForm.phone}
                            onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                            keyboardType="phone-pad"
                        />

                        <Text style={styles.label}>Vai trò</Text>
                        <View style={styles.roleSelector}>
                            {['customer', 'shop_owner', 'barber', 'admin'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[styles.roleOption, editForm.role === role && styles.roleOptionActive]}
                                    onPress={() => setEditForm({ ...editForm, role })}
                                >
                                    <Text style={[styles.roleOptionText, editForm.role === role && styles.roleOptionTextActive]}>
                                        {role === 'customer' ? 'Customer' : role === 'shop_owner' ? 'Shop Owner' : role === 'barber' ? 'Barber' : 'Admin'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Lưu</Text>
                            </TouchableOpacity>
                        </View>
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        margin: SPACING.m,
        padding: SPACING.s,
        borderRadius: RADIUS.s,
        gap: SPACING.s,
    },
    searchInput: { flex: 1, fontSize: 14 },
    listContainer: { padding: SPACING.m, paddingTop: 0, flexGrow: 1 },
    userCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: SPACING.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.m, flex: 1 },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    userDetails: { flex: 1 },
    userName: { fontWeight: '600', fontSize: 15 },
    userEmail: { fontSize: 13, color: COLORS.textLight },
    userPhone: { fontSize: 12, color: COLORS.textLight },
    userActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s },
    roleBadge: { paddingHorizontal: SPACING.s, paddingVertical: 4, borderRadius: RADIUS.s },
    roleText: { fontSize: 11, color: COLORS.white, fontWeight: '600' },
    editButton: { padding: SPACING.xs },
    deleteButton: { padding: SPACING.xs },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.xxl },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.m },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.m },
    modalContent: { backgroundColor: COLORS.white, borderRadius: RADIUS.m, padding: SPACING.l },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.m },
    label: { fontSize: 14, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.s },
    input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.s, padding: SPACING.s },
    roleSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },
    roleOption: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.m, borderRadius: RADIUS.s, backgroundColor: COLORS.background },
    roleOptionActive: { backgroundColor: COLORS.primary },
    roleOptionText: { fontSize: 13 },
    roleOptionTextActive: { color: COLORS.white },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.s, marginTop: SPACING.l },
    cancelButton: { paddingVertical: SPACING.s, paddingHorizontal: SPACING.m },
    cancelButtonText: { color: COLORS.textLight },
    saveButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.s, paddingHorizontal: SPACING.l, borderRadius: RADIUS.s },
    saveButtonText: { color: COLORS.white, fontWeight: '600' },
});
