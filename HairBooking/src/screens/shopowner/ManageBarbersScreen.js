import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { Button } from '../../components/Button';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageBarbersScreen = ({ navigation }) => {
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const { data: barbers, isLoading } = useQuery({
        queryKey: ['myBarbers'],
        queryFn: async () => {
            const res = await client.get('/shop-owner/barbers');
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => client.delete(`/shop-owner/barbers/${id}`),
        onSuccess: () => {
            Alert.alert('Thành công', 'Xóa thợ thành công');
            queryClient.invalidateQueries(['myBarbers']);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Xóa thất bại');
        }
    });

    const onRefresh = async () => {
        setRefreshing(true);
        queryClient.invalidateQueries(['myBarbers']);
        setRefreshing(false);
    };

    const handleDelete = (id, name) => {
        Alert.alert(
            'Xóa thợ',
            `Bạn có chắc muốn xóa ${name}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                {item.avatar ? (
                    <TouchableOpacity onPress={() => {}}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{item.name?.charAt(0)}</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Ionicons name="person" size={20} color={COLORS.textLight} />
                    </View>
                )}
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.specialty}>{item.specialty || 'Thợ cắt tóc'}</Text>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '0.0'}</Text>
                        <Text style={styles.reviewCount}>({item.totalReviews || 0} đánh giá)</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('EditBarber', { barber: item })}
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
                    <Ionicons name="people-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.statText}>{item.totalCustomers || 0} khách</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
                    <Text style={styles.statText}>{item.experience || 0} năm kn</Text>
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
                <Text style={styles.title}>Thợ cắt tóc ({barbers?.length || 0})</Text>
                <TouchableOpacity 
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('AddBarber')}
                >
                    <Ionicons name="add" size={20} color={COLORS.surface} />
                    <Text style={styles.addBtnText}>Thêm thợ</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={barbers || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={60} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>Chưa có thợ cắt tóc</Text>
                        <Button 
                            title="Thêm thợ đầu tiên" 
                            onPress={() => navigation.navigate('AddBarber')}
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
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    avatarPlaceholder: { backgroundColor: COLORS.background },
    avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.surface },
    info: { flex: 1, marginLeft: SPACING.m },
    name: { fontSize: 16, fontWeight: '700', color: COLORS.title },
    specialty: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
    rating: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    ratingText: { fontSize: 13, fontWeight: '600', color: '#F59E0B', marginLeft: 2 },
    reviewCount: { fontSize: 12, color: COLORS.textLight, marginLeft: 4 },
    actions: { flexDirection: 'row', gap: SPACING.s },
    actionBtn: { padding: SPACING.s },
    cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.m, paddingTop: SPACING.m, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    statItem: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.m },
    statText: { fontSize: 12, color: COLORS.textLight, marginLeft: 4 },
    statusBadge: { marginLeft: 'auto', paddingHorizontal: SPACING.s, paddingVertical: 2, borderRadius: RADIUS.s },
    statusText: { fontSize: 11, color: COLORS.surface, fontWeight: '600' },
    empty: { alignItems: 'center', marginTop: SPACING.xl * 2 },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginVertical: SPACING.m },
});
