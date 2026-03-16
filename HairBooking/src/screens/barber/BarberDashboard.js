// src/screens/barber/BarberDashboard.js
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons as Icon } from '@expo/vector-icons';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../theme';

const { width } = Dimensions.get('window');

// Mock data cho biểu đồ (Bar Chart)
const HOURLY_DATA = [10, 25, 15, 40, 30, 60, 20]; // Chiều cao tương đối của cột

export const BarberDashboard = () => {
    const [timeRange, setTimeRange] = useState('day'); // 'day', 'week', 'month'

    const { data: income, isLoading } = useQuery({
        queryKey: ['barber-income', timeRange],
        queryFn: async () => (await client.get(`/barber/income?range=${timeRange}`)).data
    });

    // Helper format tiền tệ
    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('vi-VN') + ' đ';
    };

    // Component: Tab chọn thời gian
    const FilterTabs = () => (
        <View style={styles.tabContainer}>
            {['day', 'week', 'month'].map((tab) => {
                const isActive = timeRange === tab;
                const labels = { day: 'Hôm nay', week: 'Tuần này', month: 'Tháng này' };
                return (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabItem, isActive && styles.tabItemActive]}
                        onPress={() => setTimeRange(tab)}
                    >
                        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                            {labels[tab]}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    // Component: Thẻ thống kê nhỏ
    const StatCard = ({ label, value, icon, color, subValue }) => (
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Icon name={icon} size={24} color={color} />
            </View>
            <View style={{ marginTop: 12 }}>
                <Text style={styles.cardLabel}>{label}</Text>
                <Text style={styles.cardValue}>{value}</Text>
                {subValue && <Text style={styles.cardSub}>{subValue}</Text>}
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Hiệu suất làm việc 🚀</Text>
                <Text style={styles.subtitle}>Theo dõi doanh thu & khách hàng</Text>
            </View>

            <FilterTabs />

            {/* Grid Thống kê */}
            <View style={styles.grid}>
                <View style={styles.col}>
                    <StatCard
                        label="Doanh thu"
                        value={formatCurrency(income?.dailyIncome || 0)}
                        icon="wallet-outline"
                        color="#10B981" // Green
                        subValue="+12% so với hôm qua" // Mockup trend
                    />
                </View>
                <View style={styles.col}>
                    <StatCard
                        label="Khách hàng"
                        value={income?.count || 0}
                        icon="people-outline"
                        color="#3B82F6" // Blue
                        subValue="3 khách đang chờ"
                    />
                </View>
            </View>

            {/* Mục tiêu ngày (Goal Progress) */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mục tiêu ngày</Text>
                    <Text style={styles.goalText}>75%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '75%' }]} />
                </View>
                <Text style={styles.goalSub}>Đã đạt {formatCurrency(income?.dailyIncome)} / {formatCurrency(2000000)}</Text>
            </View>

            {/* Biểu đồ giả lập (CSS Chart) */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Biểu đồ giờ cao điểm</Text>
                <View style={styles.chartContainer}>
                    {HOURLY_DATA.map((height, index) => (
                        <View key={index} style={styles.chartBarWrapper}>
                            <View style={[styles.chartBar, { height: height + '%' }]} />
                            <Text style={styles.chartLabel}>{9 + index}h</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Đánh giá gần đây */}
            <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
                <Text style={styles.sectionTitle}>Chất lượng dịch vụ</Text>
                <View style={styles.ratingRow}>
                    <View style={styles.ratingBox}>
                        <Text style={styles.ratingScore}>4.9</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {[1, 2, 3, 4, 5].map(i => <Icon key={i} name="star" size={12} color="#F59E0B" />)}
                        </View>
                        <Text style={styles.ratingCount}>128 đánh giá</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 16 }}>
                        <Text style={styles.comment}>"Cắt rất kỹ, đẹp trai hẳn!"</Text>
                        <Text style={styles.commentUser}>- Nguyễn Văn A</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header
    header: { padding: SPACING.l, paddingBottom: SPACING.m },
    title: { fontSize: 24, fontWeight: '800', color: COLORS.title || '#0F172A' },
    subtitle: { fontSize: 14, color: COLORS.textLight, marginTop: 4 },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.l,
        borderRadius: RADIUS.m,
        padding: 4,
        marginBottom: SPACING.l,
        borderWidth: 1, borderColor: '#F3F4F6'
    },
    tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.s },
    tabItemActive: { backgroundColor: COLORS.surface, ...SHADOW, shadowOpacity: 0.1 }, // Nếu muốn nổi bật hơn có thể dùng màu Primary
    tabText: { fontWeight: '600', color: COLORS.textLight, fontSize: 13 },
    tabTextActive: { color: COLORS.primary, fontWeight: '700' },

    // Grid Stats
    grid: { flexDirection: 'row', paddingHorizontal: SPACING.l, gap: SPACING.m, marginBottom: SPACING.l },
    col: { flex: 1 },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: RADIUS.l,
        ...SHADOW, shadowOpacity: 0.05,
        minHeight: 140,
        justifyContent: 'space-between'
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        alignSelf: 'flex-start'
    },
    cardLabel: { fontSize: 13, color: COLORS.textLight, fontWeight: '600', marginBottom: 4 },
    cardValue: { fontSize: 20, fontWeight: '800', color: COLORS.title || '#333' },
    cardSub: { fontSize: 11, color: '#10B981', marginTop: 4, fontWeight: '500' },

    // Section Goal
    sectionContainer: {
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.l,
        padding: SPACING.m,
        borderRadius: RADIUS.l,
        marginBottom: SPACING.l,
        ...SHADOW, shadowOpacity: 0.03,
        borderWidth: 1, borderColor: '#F9FAFB'
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.title },
    goalText: { fontWeight: '800', color: COLORS.primary },
    progressBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
    goalSub: { fontSize: 12, color: COLORS.textLight, marginTop: 8, textAlign: 'right' },

    // Chart
    chartContainer: {
        height: 150,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingTop: 20,
    },
    chartBarWrapper: { alignItems: 'center', width: (width - 80) / 7 },
    chartBar: {
        width: 8,
        backgroundColor: COLORS.primary,
        borderRadius: 4,
        opacity: 0.8,
        marginBottom: 8
    },
    chartLabel: { fontSize: 10, color: COLORS.textLight },

    // Rating
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    ratingBox: {
        alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F3F4F6', paddingRight: 16
    },
    ratingScore: { fontSize: 32, fontWeight: '800', color: COLORS.title },
    ratingCount: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
    comment: { fontStyle: 'italic', color: COLORS.text, fontSize: 13 },
    commentUser: { fontSize: 11, color: COLORS.textLight, marginTop: 4, fontWeight: '600' }
});