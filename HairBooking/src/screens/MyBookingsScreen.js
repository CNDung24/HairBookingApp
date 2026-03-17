// src/screens/MyBookingsScreen.js
import React, { useContext, useState, useMemo } from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    ActivityIndicator, StatusBar, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { BookingCard } from '../components/BookingCard';
import { Button } from '../components/Button';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

export const MyBookingsScreen = () => {
    const { user } = useContext(AuthContext);
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState('upcoming');

    // --- GIAO DIỆN KHÁCH (GUEST) ---
    if (!user) {
        return (
            <View style={styles.guestContainer}>
                <View style={styles.guestContent}>
                    <View style={styles.guestIconBg}>
                        <Icon name="calendar-outline" size={60} color={COLORS.primary} />
                    </View>
                    <Text style={styles.guestTitle}>Quản lý lịch hẹn</Text>
                    <Text style={styles.guestSubtitle}>
                        Đăng nhập để xem lịch hẹn sắp tới và lịch sử sử dụng dịch vụ của bạn.
                    </Text>
                </View>
                <Button
                    title="Đăng Nhập Ngay"
                    onPress={() => navigation.navigate('Login')}
                />
            </View>
        );
    }

    // --- LOGIC LẤY DỮ LIỆU ---
    const { data: bookings, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['my-bookings'],
        queryFn: async () => {
            const res = await client.get('/bookings/my-bookings');
            return res.data;
        },
        enabled: !!user,
    });

    const { data: myReviews = [] } = useQuery({
        queryKey: ['my-reviews'],
        queryFn: async () => {
            const res = await client.get('/reviews/my-reviews');
            return res.data.data || [];
        },
        enabled: !!user,
    });

    const reviewedBookingIds = useMemo(() => {
        return new Set(myReviews.map(r => r.BookingId));
    }, [myReviews]);

    const canReview = (booking) => {
        return booking.status === 'done' && !reviewedBookingIds.has(booking.id);
    };

    // --- LOGIC LỌC DỮ LIỆU THEO TAB ---
    const filteredBookings = useMemo(() => {
        if (!bookings) return [];

        const now = new Date();

        if (activeTab === 'upcoming') {
            return bookings.filter(b =>
                ['pending', 'confirmed'].includes(b.status) ||
                (new Date(b.booking_date) >= now && b.status !== 'cancelled')
            );
        } else {
            return bookings.filter(b =>
                ['done', 'cancelled'].includes(b.status)
            );
        }
    }, [bookings, activeTab]);

    // --- COMPONENT TAB BUTTON ---
    const TabButton = ({ title, id }) => {
        const isActive = activeTab === id;
        return (
            <TouchableOpacity
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(id)}
                activeOpacity={0.8}
            >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {title}
                </Text>
            </TouchableOpacity>
        );
    };

    // --- COMPONENT RENDER ITEM ---
    const renderItem = ({ item }) => (
        <View style={{ marginBottom: SPACING.m }}>
            <BookingCard
                booking={item}
                onPress={() => {
                    if (canReview(item)) {
                        navigation.navigate('Review', { booking: item });
                    }
                }}
            />
            {canReview(item) && (
                <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => navigation.navigate('Review', { booking: item })}
                >
                    <Icon name="star-outline" size={18} color="#fff" />
                    <Text style={styles.reviewButtonText}>Đánh giá ngay</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // --- COMPONENT EMPTY STATE ---
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon
                name={activeTab === 'upcoming' ? "calendar-clear-outline" : "time-outline"}
                size={50}
                color={COLORS.textLight}
                style={{ marginBottom: 16, opacity: 0.5 }}
            />
            <Text style={styles.emptyTitle}>Chưa có lịch hẹn nào</Text>
            <Text style={styles.emptyText}>
                {activeTab === 'upcoming'
                    ? "Bạn chưa đặt lịch hẹn nào sắp tới. Hãy khám phá các salon ngay!"
                    : "Bạn chưa có lịch sử sử dụng dịch vụ nào."}
            </Text>
            {activeTab === 'upcoming' && (
                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={{ marginTop: 20 }}>
                    <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Đặt lịch ngay</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    // --- MAIN RENDER ---
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color={COLORS.title} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch Hẹn Của Tôi</Text>
                <View style={styles.backButton} />
            </View>

            {/* Tab Control */}
            <View style={styles.tabContainer}>
                <TabButton title="Sắp tới" id="upcoming" />
                <TabButton title="Lịch sử" id="history" />
            </View>

            {/* Content List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredBookings}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    ListEmptyComponent={renderEmpty}
                />
            )}
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

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        backgroundColor: COLORS.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.title || '#0F172A',
        textAlign: 'center',
    },

    // Tab Styles
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.l,
        marginBottom: SPACING.m,
        borderRadius: RADIUS.m,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border || '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: RADIUS.s,
    },
    tabActive: {
        backgroundColor: COLORS.primary,
        ...SHADOW,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    tabTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },

    // List Styles
    listContent: {
        paddingHorizontal: SPACING.l,
        paddingBottom: 20,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1, justifyContent: 'center', alignItems: 'center'
    },

    // Review Button
    reviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: RADIUS.m,
        marginTop: -SPACING.s,
    },
    reviewButtonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 14,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        fontSize: 14,
        lineHeight: 20,
    },

    // Guest Styles
    guestContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.l,
        justifyContent: 'center',
    },
    guestContent: { alignItems: 'center', marginBottom: 60 },
    guestIconBg: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: COLORS.primarySoft || '#FFE4D6',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: SPACING.l,
    },
    guestTitle: { fontSize: 24, fontWeight: '800', color: COLORS.title, marginBottom: 12 },
    guestSubtitle: {
        textAlign: 'center', color: COLORS.textLight, fontSize: 16, lineHeight: 24,
    },
});
