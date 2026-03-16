// src/screens/admin/AdminDashboardScreen.js
import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../theme';

export const AdminDashboardScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    // Lấy dữ liệu Shops thật
    const { data: shops } = useQuery({
        queryKey: ['shops'],
        queryFn: async () => (await client.get('/shops')).data
    });

    // Component con: Thẻ thống kê (Stat Card)
    const StatCard = ({ label, value, icon, color, bgColor }) => (
        <View style={[styles.statCard, { backgroundColor: bgColor }]}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Icon name={icon} size={20} color="#FFF" />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    // Component con: Nút điều hướng (Action Item)
    const ActionItem = ({ label, icon, onPress, subLabel }) => (
        <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIconBox, { backgroundColor: COLORS.primary + '10' }]}>
                <Icon name={icon} size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.actionLabel}>{label}</Text>
                {subLabel && <Text style={styles.actionSub}>{subLabel}</Text>}
            </View>
            <Icon name="chevron-forward" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Admin Portal</Text>
                    <Text style={styles.title}>Tổng quan hệ thống</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <Icon name="person-circle" size={36} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.statsGrid}>
                    <StatCard
                        label="Cửa hàng"
                        value={shops?.length || 0}
                        icon="business"
                        bgColor="#3B82F6" // Blue
                    />
                    <StatCard
                        label="Người dùng"
                        value={0}
                        icon="people"
                        bgColor="#F59E0B" // Orange
                    />
                    <StatCard
                        label="Doanh thu"
                        value="0"
                        icon="wallet"
                        bgColor="#10B981" // Green
                    />
                    <StatCard
                        label="Đang đặt"
                        value={0}
                        icon="calendar"
                        bgColor="#6366F1" // Indigo
                    />
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Quản lý dữ liệu</Text>
                    <View style={styles.menuList}>
                        <ActionItem
                            label="Quản lý Shops"
                            subLabel="Thêm, sửa, xóa các tiệm cắt tóc"
                            icon="storefront-outline"
                            onPress={() => navigation.navigate('ManageShops')}
                        />
                        <View style={styles.divider} />
                        <ActionItem
                            label="Quản lý Dịch vụ"
                            subLabel="Thêm, sửa, xóa dịch vụ"
                            icon="cut-outline"
                            onPress={() => navigation.navigate('ManageService')}
                        />
                        <View style={styles.divider} />
                        <ActionItem
                            label="Quản lý Users"
                            subLabel="Danh sách khách hàng & Barbers"
                            icon="people-outline"
                            onPress={() => navigation.navigate('ManageUsers')}
                        />
                        <View style={styles.divider} />
                        <ActionItem
                            label="Quản lý Bookings"
                            subLabel="Xem và cập nhật lịch hẹn"
                            icon="calendar-outline"
                            onPress={() => navigation.navigate('ManageBookings')}
                        />
                        <View style={styles.divider} />
                        <ActionItem
                            label="Duyệt shop đăng ký"
                            subLabel="Duyệt yêu cầu mở tiệm"
                            icon="checkmark-circle-outline"
                            onPress={() => navigation.navigate('ManageShopRequests')}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.l, paddingBottom: SPACING.m, paddingTop: SPACING.s
    },
    greeting: { fontSize: 12, fontWeight: '600', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.title || '#0F172A' },
    profileBtn: { padding: 4 },

    scrollContent: { paddingHorizontal: SPACING.l, paddingBottom: 40 },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
        marginBottom: SPACING.l, gap: SPACING.m
    },
    statCard: {
        width: '47%', // 2 card một hàng với gap
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        ...SHADOW, shadowOpacity: 0.1, shadowRadius: 4,
        elevation: 4
    },
    iconBox: {
        width: 32, height: 32, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center', marginBottom: 12
    },
    statValue: { fontSize: 20, fontWeight: '800', color: '#FFF' },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2, fontWeight: '500' },

    // Sections
    sectionContainer: { marginBottom: SPACING.l },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.title, marginBottom: 12 },

    // Menu List
    menuList: {
        backgroundColor: COLORS.surface, borderRadius: RADIUS.m,
        padding: SPACING.s,
        ...SHADOW, shadowOpacity: 0.05
    },
    actionItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 12, paddingHorizontal: 8
    },
    actionIconBox: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    actionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.title },
    actionSub: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 56 },

    // Activity
    activityCard: {
        backgroundColor: COLORS.surface, borderRadius: RADIUS.m,
        padding: SPACING.m,
        ...SHADOW, shadowOpacity: 0.05
    },
    activityItem: { flexDirection: 'row', paddingVertical: 10 },
    activityBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    activityText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
    activityTime: { fontSize: 11, color: COLORS.textLight, marginTop: 2 }
});