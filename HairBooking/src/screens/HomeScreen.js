// src/screens/HomeScreen.js
import React, { useContext, useState, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity,
    Image, ActivityIndicator, ScrollView, RefreshControl, useWindowDimensions, ImageBackground
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { ShopCard } from '../components/ShopCard';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

const CATEGORIES = [
    { id: '1', name: 'Tất cả', icon: 'grid-outline' },
    { id: '2', name: 'Cắt tóc', icon: 'cut-outline' },
    { id: '3', name: 'Gội đầu', icon: 'water-outline' },
    { id: '4', name: 'Massage', icon: 'happy-outline' },
];

export const HomeScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const [activeCategory, setActiveCategory] = useState('1');
    const { isWeb, isDesktop, isTablet, containerWidth } = useResponsive();

    const { data: shops, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['shops'],
        queryFn: async () => {
            const res = await client.get('/shops');
            return res.data;
        }
    });

    const renderHeader = () => (
        <View style={styles.headerSection}>
            {/* Dark curved header background */}
            <View style={styles.mainContent}>
                {/* User & Login Row */}
                <View style={styles.topRow}>
                    <View style={styles.userInfo}>
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Icon name="person" size={24} color={COLORS.primary} />
                            </View>
                        )}
                        <View style={styles.greetingTextContainer}>
                            <Text style={styles.greeting}>Xin chào 👋</Text>
                            <Text style={styles.username}>
                                {user ? user.name : 'Khách'}
                            </Text>
                        </View>
                    </View>

                    {!user && (
                        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginBtnText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Search Bar - styled to match mockup */}
                <TouchableOpacity
                    style={styles.searchBar}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('Search')}
                >
                    <Icon name="search-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.searchPlaceholder}>Tìm kiếm vị trí của bạn</Text>
                </TouchableOpacity>

                {/* Promo Banner */}
                <View style={styles.bannerContainer}>
                    <View style={styles.bannerContent}>
                        <ImageBackground
                            source={{ uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop' }}
                            style={styles.bannerImage}
                            imageStyle={{ borderRadius: RADIUS.l }}
                        >
                            <View style={styles.bannerOverlay}>
                                <Text style={styles.bannerTitle}>REFRESH</Text>
                                <Text style={styles.bannerTitleHighlight}>YOUR STYLE</Text>
                                <Text style={styles.bannerSubtitle}>AND RENEW YOUR LOOK</Text>

                                <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 10 }}>
                                    <Text style={styles.bannerSmallText}>BOOK NOW AND GET 10% OFF</Text>
                                    <Text style={styles.bannerSmallText}>ON YOUR FIRST HAIRCUT!</Text>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>
                    {/* Pagination dots under banner */}
                    <View style={styles.pagination}>
                        <View style={[styles.dot, styles.dotActive]} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>
                </View>

                {/* Categories - slightly restyled to match new colors */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                >
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.categoryItem, isActive && styles.categoryItemActive]}
                                onPress={() => setActiveCategory(cat.id)}
                            >
                                <Icon
                                    name={cat.icon}
                                    size={18}
                                    color={isActive ? '#FFF' : COLORS.textLight}
                                />
                                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Salon Nổi Bật</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.seeAllRow}>
                        <Text style={styles.seeAll}>Xem thêm</Text>
                        <Icon name="chevron-forward" size={16} color={COLORS.primary} style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const responsiveStyles = getHomeStyles({ isWeb, isDesktop, isTablet, containerWidth });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            {isLoading ? (
                <View style={[styles.centerLoading, { paddingTop: insets.top + 100 }]}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={{ marginTop: 10, color: COLORS.textLight }}>Đang tìm salon gần bạn...</Text>
                </View>
            ) : (
                <FlatList
                    data={shops}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={[
                            { marginBottom: SPACING.m },
                            isWeb ? responsiveStyles.shopCardContainer : { paddingHorizontal: SPACING.l }
                        ]}>
                            <ShopCard
                                shop={item}
                                onPress={() => navigation.navigate('ShopDetail', { shopId: item.id })}
                            />
                        </View>
                    )}
                    ListHeaderComponent={renderHeader}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                    }
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Không tìm thấy cửa hàng nào</Text>
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },

    // Header Section with Curve
    headerSection: {
        marginBottom: SPACING.s,
    },
    darkHeaderBg: {
        backgroundColor: COLORS.headerBackground || '#35434A',
        height: 180,
        width: '100%',
        alignItems: 'center',
        paddingTop: 60,
        position: 'relative',
        zIndex: 1,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoText1: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    logoText2: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginTop: -8,
    },
    curveBottom: {
        position: 'absolute',
        bottom: -40,
        width: '150%',
        height: 100,
        backgroundColor: COLORS.background, // Match screen bg wrapper
        borderTopLeftRadius: 1000,
        borderTopRightRadius: 1000,
        zIndex: 2,
    },

    mainContent: {
        zIndex: 3,
        marginTop: -20, // Pull up into the curve
    },

    // User Row
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingTop: 48, // Safe area buffer for status bar / notch
        paddingBottom: SPACING.m,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    avatarPlaceholder: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#D7AE86', // Lighter brown for placeholder bg
        justifyContent: 'center', alignItems: 'center'
    },
    greetingTextContainer: {
        marginLeft: 12,
    },
    greeting: { fontSize: 13, color: COLORS.primaryDark, fontWeight: '500', marginBottom: 2 },
    username: { fontSize: 18, fontWeight: '800', color: COLORS.title || '#0F172A' },

    loginBtn: {
        backgroundColor: '#B68B63',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    loginBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Search Bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.l,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 30, // Very rounded
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: COLORS.primaryLight,
        ...SHADOWS?.small,
    },
    searchPlaceholder: { flex: 1, marginLeft: 12, color: COLORS.textLight, fontSize: 15 },

    // Banner
    bannerContainer: { paddingHorizontal: SPACING.l, marginBottom: SPACING.m },
    bannerContent: {
        borderRadius: RADIUS.l,
        overflow: 'hidden',
        height: 180,
        backgroundColor: '#1C1C1E',
    },
    bannerImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
    },
    bannerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    bannerTitleHighlight: { fontSize: 24, fontWeight: '900', color: '#F8B568', marginBottom: 4 },
    bannerSubtitle: { fontSize: 12, color: '#FFF', fontWeight: '600', marginBottom: 16 },
    bannerSmallText: { fontSize: 8, color: '#EEE', textAlign: 'center' },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
    dotActive: { backgroundColor: COLORS.primary },

    // Categories
    categoryList: { paddingHorizontal: SPACING.l, paddingBottom: SPACING.l },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingVertical: 10, paddingHorizontal: 16,
        borderRadius: 25,
        marginRight: 10,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    categoryItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    categoryText: { marginLeft: 8, fontWeight: '600', color: COLORS.textLight },
    categoryTextActive: { color: '#FFF' },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.title || '#0F172A' },
    seeAllRow: { flexDirection: 'row', alignItems: 'center' },
    seeAll: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },

    // Misc
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.textLight },
});

export const getHomeStyles = (responsive) => ({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
    },
    contentContainer: {
        width: responsive.containerWidth,
        maxWidth: 1200,
    },
    shopCardContainer: {
        paddingHorizontal: responsive.isDesktop ? 0 : SPACING.l,
    },
});