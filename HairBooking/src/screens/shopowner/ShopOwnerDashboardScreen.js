import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../theme';

export const ShopOwnerDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [refreshing, setRefreshing] = useState(false);

    const { data: shopData } = useQuery({
        queryKey: ['myShop'],
        queryFn: async () => {
            const res = await client.get('/shop-owner/shop');
            return res.data;
        }
    });

    const { data: statsData } = useQuery({
        queryKey: ['shopStats'],
        queryFn: async () => {
            const res = await client.get('/shop-owner/stats');
            return res.data;
        }
    });

    const onRefresh = async () => {
        setRefreshing(true);
        queryClient.invalidateQueries(['myShop']);
        queryClient.invalidateQueries(['shopStats']);
        setRefreshing(false);
    };

    const shop = shopData;

    const StatCard = ({ label, value, icon, color }) => (
        <View style={[styles.statCard, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#FFF" />
            <Text style={styles.statValue}>{value || 0}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const ActionItem = ({ label, icon, onPress, color = COLORS.primary }) => (
        <TouchableOpacity style={styles.actionItem} onPress={onPress}>
            <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={22} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Shop Owner</Text>
                        <Text style={styles.shopName}>{shop?.name || 'Chưa có shop'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity 
                            style={styles.viewShopButton}
                            onPress={() => navigation.navigate('ViewMyShop')}
                        >
                            <Ionicons name="eye-outline" size={18} color={COLORS.white} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('ManageShop')}>
                            {shop?.logo ? (
                                <Image source={{ uri: shop.logo }} style={styles.logo} />
                            ) : (
                                <View style={[styles.logo, styles.logoPlaceholder]}>
                                    <Ionicons name="business" size={24} color={COLORS.textLight} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.statsGrid}>
                    <StatCard label="Đơn hôm nay" value={statsData?.todayBookings} icon="calendar" color="#3B82F6" />
                    <StatCard label="Tháng này" value={statsData?.monthlyRevenue} icon="wallet" color="#10B981" />
                    <StatCard label="Thợ" value={statsData?.totalBarbers} icon="people" color="#F59E0B" />
                    <StatCard label="Đánh giá" value={shop?.rating?.toFixed(1) || '0'} icon="star" color="#6366F1" />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quản lý</Text>
                    <View style={styles.menuCard}>
                        <ActionItem 
                            label="Xem shop như khách hàng" 
                            icon="eye-outline" 
                            onPress={() => navigation.navigate('ViewMyShop')}
                            color="#8B5CF6"
                        />
                        <ActionItem 
                            label="Thông tin cửa hàng" 
                            icon="storefront-outline" 
                            onPress={() => navigation.navigate('ManageShop')}
                            color="#3B82F6"
                        />
                        <ActionItem 
                            label="Quản lý thợ cắt tóc" 
                            icon="people-outline" 
                            onPress={() => navigation.navigate('ManageBarbers')}
                            color="#F59E0B"
                        />
                        <ActionItem 
                            label="Quản lý dịch vụ" 
                            icon="cut-outline" 
                            onPress={() => navigation.navigate('ManageServices')}
                            color="#10B981"
                        />
                        <ActionItem 
                            label="Quản lý lịch hẹn" 
                            icon="calendar-outline" 
                            onPress={() => navigation.navigate('ManageShopBookings')}
                            color="#6366F1"
                        />
                        <ActionItem 
                            label="Quản lý đánh giá" 
                            icon="star-outline" 
                            onPress={() => navigation.navigate('ManageReviews')}
                            color="#F59E0B"
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { padding: SPACING.l, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
    greeting: { fontSize: 12, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase' },
    shopName: { fontSize: 22, fontWeight: '800', color: COLORS.title, marginTop: 4 },
    logo: { width: 50, height: 50, borderRadius: 25 },
    logoPlaceholder: { backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
    viewShopButton: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: COLORS.primary, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.l, gap: SPACING.s },
    statCard: { width: '48%', padding: SPACING.m, borderRadius: RADIUS.m, ...SHADOW },
    statValue: { fontSize: 24, fontWeight: '800', color: '#FFF', marginTop: 8 },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    section: { marginBottom: SPACING.l },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.title, marginBottom: 12 },
    menuCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.m, ...SHADOW },
    actionItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.m, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    actionLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.title, marginLeft: 12 },
});
