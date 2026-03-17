import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { Button } from '../../components/Button';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageServicesScreen = ({ navigation }) => {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const { data: services, isLoading } = useQuery({
        queryKey: ['myServices'],
        queryFn: async () => {
            const res = await client.get('/shop-owner/services');
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => client.delete(`/shop-owner/services/${id}`),
        onSuccess: () => {
            Alert.alert('Thành công', 'Xóa dịch vụ thành công');
            queryClient.invalidateQueries(['myServices']);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Xóa thất bại');
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (id) => client.patch(`/shop-owner/services/${id}/toggle`),
        onSuccess: () => {
            queryClient.invalidateQueries(['myServices']);
        }
    });

    const onRefresh = async () => {
        setRefreshing(true);
        queryClient.invalidateQueries(['myServices']);
        setRefreshing(false);
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            'Xóa dịch vụ',
            `Bạn có chắc muốn xóa ${name}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.serviceInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.name}</Text>
                        {item.isPopular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>Phổ biến</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.category}>{item.category}</Text>
                    <Text style={styles.price}>{formatPrice(item.price)}</Text>
                    {item.description && (
                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    )}
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => toggleMutation.mutate(item.id)}
                    >
                        <Ionicons 
                            name={item.isActive ? 'eye' : 'eye-off'} 
                            size={18} 
                            color={item.isActive ? COLORS.success : COLORS.textLight} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('EditService', { service: item })}
                    >
                        <Ionicons name="pencil" size={18} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => handleDelete(item.id, item.name)}
                    >
                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textLight} />
                    <Text style={styles.statText}>{item.duration} phút</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? COLORS.success : COLORS.textLight }]}>
                    <Text style={styles.statusText}>{item.isActive ? 'Hoạt động' : 'Không hoạt động'}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Dịch vụ ({services?.length || 0})</Text>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('AddService')}
                >
                    <Ionicons name="add" size={20} color={COLORS.surface} />
                    <Text style={styles.addBtnText}>Thêm dịch vụ</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                style={{ flex: 1 }}
                data={services || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="cut-outline" size={60} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>Chưa có dịch vụ</Text>
                        <Button 
                            title="Thêm dịch vụ đầu tiên" 
                            onPress={() => navigation.navigate('AddService')}
                        />
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.l },
    title: { fontSize: 20, fontWeight: '700', color: COLORS.title },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: SPACING.m, paddingVertical: SPACING.s, borderRadius: RADIUS.m, gap: 4 },
    addBtnText: { color: COLORS.surface, fontWeight: '600' },
    list: { padding: SPACING.m, paddingTop: 0 },
    card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m },
    cardHeader: { flexDirection: 'row' },
    serviceInfo: { flex: 1 },
    nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACING.xs },
    name: { fontSize: 16, fontWeight: '700', color: COLORS.title },
    popularBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    popularText: { fontSize: 10, color: COLORS.surface, fontWeight: '600' },
    category: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
    price: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginTop: 4 },
    description: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
    actions: { flexDirection: 'row', gap: SPACING.xs },
    actionBtn: { padding: SPACING.xs },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.m, paddingTop: SPACING.m, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    statItem: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.m },
    statText: { fontSize: 12, color: COLORS.textLight, marginLeft: 4 },
    statusBadge: { marginLeft: 'auto', paddingHorizontal: SPACING.s, paddingVertical: 2, borderRadius: RADIUS.s },
    statusText: { fontSize: 11, color: COLORS.surface, fontWeight: '600' },
    empty: { alignItems: 'center', marginTop: SPACING.xl * 2 },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginVertical: SPACING.m },
});
