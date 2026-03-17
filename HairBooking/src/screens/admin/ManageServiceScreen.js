// src/screens/admin/ManageServiceScreen.js
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
    TextInput, StatusBar, Alert, Switch, Platform
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../theme';

export const ManageServiceScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        ShopId: ''
    });

    const { data: services, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: async () => (await client.get('/services')).data.data
    });

    const { data: shops } = useQuery({
        queryKey: ['shops'],
        queryFn: async () => (await client.get('/shops')).data
    });

    const createMutation = useMutation({
        mutationFn: (data) => client.post('/services', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['services']);
            setModalVisible(false);
            Alert.alert('Thành công', 'Tạo dịch vụ thành công');
        },
        onError: (err) => Alert.alert('Lỗi', err.response?.data?.message || 'Tạo thất bại')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => client.delete(`/services/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['services']);
            Alert.alert('Thành công', 'Xóa dịch vụ thành công');
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => client.patch(`/services/${id}/toggle`),
        onSuccess: () => queryClient.invalidateQueries(['services'])
    });

    const handleCreate = () => {
        if (!form.name || !form.price || !form.duration || !form.ShopId) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }
        createMutation.mutate({
            ...form,
            price: parseFloat(form.price),
            duration: parseInt(form.duration),
            ShopId: parseInt(form.ShopId)
        });
    };

    const renderService = ({ item }) => (
        <View style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <Text style={styles.serviceCategory}>{item.category}</Text>
                </View>
                <Switch
                    value={item.isActive}
                    onValueChange={() => toggleMutation.mutate(item.id)}
                    trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
                />
            </View>
            <View style={styles.serviceDetails}>
                <View style={styles.detailItem}>
                    <Icon name="cash-outline" size={16} color={COLORS.success || '#10B981'} />
                    <Text style={styles.detailText}>{item.discountPrice ? item.discountPrice.toLocaleString() : item.price.toLocaleString()}đ</Text>
                    {item.discountPrice && <Text style={styles.originalPrice}>{item.price.toLocaleString()}đ</Text>}
                </View>
                <View style={styles.detailItem}>
                    <Icon name="time-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>{item.duration} phút</Text>
                </View>
            </View>
            <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => Alert.alert('Xác nhận', 'Xóa dịch vụ này?', [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate(item.id) }
                ])}
            >
                <Icon name="trash-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.title} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Dịch vụ</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Icon name="add-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loading}><Text>Đang tải...</Text></View>
            ) : (
                <FlatList
                    style={{ flex: 1 }}
                    data={services || []}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderService}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>Chưa có dịch vụ nào</Text>}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent keyboardShouldPersistTaps="handled">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Tạo Dịch vụ mới</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.title} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Tên dịch vụ *"
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mô tả"
                            value={form.description}
                            onChangeText={(t) => setForm({ ...form, description: t })}
                        />
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Giá *"
                                keyboardType="numeric"
                                value={form.price}
                                onChangeText={(t) => setForm({ ...form, price: t })}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Thời gian (phút) *"
                                keyboardType="numeric"
                                value={form.duration}
                                onChangeText={(t) => setForm({ ...form, duration: t })}
                            />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Danh mục (Cắt tóc, Gội đầu, Nhuộm...)"
                            value={form.category}
                            onChangeText={(t) => setForm({ ...form, category: t })}
                        />
                        <Text style={styles.label}>Chọn Shop *</Text>
                        <View style={styles.shopSelect}>
                            {shops?.map((shop) => (
                                <TouchableOpacity
                                    key={shop.id}
                                    style={[styles.shopChip, form.ShopId === shop.id.toString() && styles.shopChipActive]}
                                    onPress={() => setForm({ ...form, ShopId: shop.id.toString() })}
                                >
                                    <Text style={[styles.shopChipText, form.ShopId === shop.id.toString() && styles.shopChipTextActive]}>
                                        {shop.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
                            <Text style={styles.submitText}>Tạo Dịch vụ</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.l },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SPACING.l, paddingTop: 0 },
    empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 40 },
    serviceCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOW },
    serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 16, fontWeight: '700', color: COLORS.title },
    serviceCategory: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    serviceDetails: { flexDirection: 'row', gap: 16 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
    originalPrice: { fontSize: 12, color: COLORS.textLight, textDecorationLine: 'line-through', marginLeft: 4 },
    deleteBtn: { position: 'absolute', top: SPACING.m, right: SPACING.m, padding: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.l, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
    modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
    input: { backgroundColor: COLORS.background, borderRadius: RADIUS.s, padding: 12, marginBottom: 12, fontSize: 14 },
    row: { flexDirection: 'row', gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.title, marginBottom: 8 },
    shopSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    shopChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.background },
    shopChipActive: { backgroundColor: COLORS.primary },
    shopChipText: { fontSize: 13, color: COLORS.text },
    shopChipTextActive: { color: '#FFF', fontWeight: '600' },
    submitBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: RADIUS.s, alignItems: 'center', marginTop: 8 },
    submitText: { color: '#FFF', fontWeight: '700', fontSize: 15 }
});
