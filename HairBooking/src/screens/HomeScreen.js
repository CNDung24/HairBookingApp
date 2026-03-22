// src/screens/HomeScreen.js
import React, { useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
    View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity,
    Image, ActivityIndicator, ScrollView, RefreshControl, useWindowDimensions, ImageBackground, Animated, Platform
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as ExpoImage } from 'expo-image';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { ShopCard } from '../components/ShopCard';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

export const HomeScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();
    const { user } = useContext(AuthContext);
    const [activeCategory, setActiveCategory] = useState('1');
    const { isWeb, isDesktop, isTablet, containerWidth } = useResponsive();

    // Banner state
    const [banners, setBanners] = useState([]);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    // Tính chiều rộng banner
    const bannerWidth = screenWidth - 2 * SPACING.l;

    // Fetch banners
    const { data: bannersData } = useQuery({
        queryKey: ['banners'],
        queryFn: async () => {
            const res = await client.get('/banners');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (bannersData && bannersData.length > 0) {
            setBanners(bannersData);
        }
    }, [bannersData]);

    // Auto-rotate banner - chuyển mỗi 3 giây
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentBannerIndex(prev => (prev + 1) % banners.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [banners.length]);

    // Scroll to current banner when index changes
    useEffect(() => {
        if (banners.length > 1 && flatListRef.current) {
            const timeout = setTimeout(() => {
                try {
                    flatListRef.current?.scrollTo({
                        x: currentBannerIndex * bannerWidth,
                        animated: true
                    });
                } catch (e) {
                    // Ignore scroll errors
                }
            }, 100);
            return () => clearTimeout(timeout);
        }
    }, [currentBannerIndex, bannerWidth, banners.length]);

    // Navigation functions
    const goToNextSlide = () => {
        const nextIndex = (currentBannerIndex + 1) % banners.length;
        setCurrentBannerIndex(nextIndex);
    };

    const goToPrevSlide = () => {
        const prevIndex = (currentBannerIndex - 1 + banners.length) % banners.length;
        setCurrentBannerIndex(prevIndex);
    };

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
                    <Text style={styles.searchPlaceholder}>Tìm kiếm</Text>
                </TouchableOpacity>

                {/* Promo Banner - Auto Slide */}
                <View style={[styles.bannerContainer, { width: containerWidth }]}>
                    {banners.length > 0 ? (
                        <>
                            <Animated.ScrollView
                                ref={flatListRef}
                                horizontal
                                snapToInterval={bannerWidth}
                                decelerationRate="fast"
                                snapToAlignment="center"
                                showsHorizontalScrollIndicator={false}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                    { useNativeDriver: false }
                                )}
                                scrollEventThrottle={16}
                                onMomentumScrollEnd={(event) => {
                                    const slideSize = event.nativeEvent.layoutMeasurement.width;
                                    const index = event.nativeEvent.contentOffset.x / slideSize;
                                    const roundIndex = Math.round(index);
                                    setCurrentBannerIndex(roundIndex);
                                }}
                            >
                                {banners.map((item, index) => (
                                    <View key={item.id} style={[styles.bannerContent, { width: bannerWidth }]}>
                                        <ExpoImage
                                            source={{ uri: item.image }}
                                            style={styles.bannerImage}
                                            contentFit="cover"
                                            transition={500}
                                        />
                                        <View style={styles.bannerOverlay}>
                                            <View style={styles.glassContainer}>
                                                {item.title && (
                                                    <View>
                                                        <Text style={styles.bannerTitle}>{item.title}</Text>
                                                        {item.description && (
                                                            <Text style={styles.bannerSubtitle}>{item.description}</Text>
                                                        )}
                                                    </View>
                                                )}
                                                {!item.title && (
                                                    <View>
                                                        <Text style={styles.bannerTitle}>REFRESH</Text>
                                                        <Text style={styles.bannerTitleHighlight}>YOUR STYLE</Text>
                                                        <Text style={styles.bannerSubtitle}>And renew your look</Text>
                                                    </View>
                                                )}
                                                <TouchableOpacity style={styles.bannerActionBtn}>
                                                    <Text style={styles.bannerActionText}>Khám phá</Text>
                                                    <Icon name="arrow-forward" size={14} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </Animated.ScrollView>

                            {/* Navigation Arrows (Swiper style) */}
                            <TouchableOpacity
                                style={[styles.navBtn, styles.prevBtn]}
                                onPress={goToPrevSlide}
                                activeOpacity={0.7}
                            >
                                <Icon name="chevron-back" size={20} color="#FFF" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.navBtn, styles.nextBtn]}
                                onPress={goToNextSlide}
                                activeOpacity={0.7}
                            >
                                <Icon name="chevron-forward" size={20} color="#FFF" />
                            </TouchableOpacity>

                            {/* Pagination dots - fixed interpolation */}
                            <View style={styles.pagination}>
                                {banners.map((_, index) => {
                                    const inputRange = [
                                        (index - 1) * bannerWidth,
                                        index * bannerWidth,
                                        (index + 1) * bannerWidth
                                    ];

                                    const dotScale = scrollX.interpolate({
                                        inputRange,
                                        outputRange: [1, 1.5, 1],
                                        extrapolate: 'clamp',
                                    });

                                    const opacity = scrollX.interpolate({
                                        inputRange,
                                        outputRange: [0.4, 1, 0.4],
                                        extrapolate: 'clamp',
                                    });

                                    return (
                                        <View key={index} style={styles.dotWrapper}>
                                            <Animated.View
                                                style={[
                                                    styles.dot,
                                                    {
                                                        transform: [{ scale: dotScale }],
                                                        opacity,
                                                    }
                                                ]}
                                            />
                                        </View>
                                    );
                                })}
                            </View>
                        </>
                    ) : (
                        // Fallback banner when no banners in DB
                        <View style={styles.bannerContent}>
                            <ExpoImage
                                source={{ uri: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop' }}
                                style={styles.bannerImage}
                                contentFit="cover"
                            />
                            <View style={styles.bannerOverlay}>
                                <View style={styles.glassContainer}>
                                    <Text style={styles.bannerTitle}>REFRESH</Text>
                                    <Text style={styles.bannerTitleHighlight}>YOUR STYLE</Text>
                                    <Text style={styles.bannerSubtitle}>AND RENEW YOUR LOOK</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Categories - slightly restyled to match new colors */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                >
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
        paddingTop: 52, // Better status bar buffer
        paddingBottom: SPACING.m,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F3E9DD',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
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
        ...SHADOWS.small,
    },
    searchPlaceholder: { flex: 1, marginLeft: 12, color: COLORS.textLight, fontSize: 15 },

    // Banner
    bannerContainer: {
        marginHorizontal: SPACING.l,
        marginBottom: SPACING.m,
        borderRadius: RADIUS.l,
        overflow: 'hidden',
        ...SHADOWS?.medium,
    },
    bannerContent: {
        width: '100%',
        height: 190,
        backgroundColor: '#1C1C1E',
        position: 'relative',
    },
    bannerImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 16,
        justifyContent: 'flex-end',
    },
    glassContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 14,
        borderRadius: RADIUS.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        // Web blur effect (doesn't work on mobile without extra libs but stays clean)
        ...(Platform.OS === 'web' && { backdropFilter: 'blur(10px)' }),
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFF',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    bannerTitleHighlight: {
        fontSize: 20,
        fontWeight: '900',
        color: '#B68B63',
        marginBottom: 2
    },
    bannerSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    bannerActionBtn: {
        backgroundColor: '#B68B63',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerActionText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '800',
        marginRight: 4,
    },

    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    dotWrapper: {
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#B68B63',
    },

    // Swiper Navigation Buttons
    navBtn: {
        position: 'absolute',
        top: '50%',
        marginTop: -18, // center icon (36/2)
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    prevBtn: {
        left: 8,
    },
    nextBtn: {
        right: 8,
    },

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
        // On mobile, items should stretch to fill width
        alignItems: responsive.isWeb ? 'center' : 'stretch',
    },
    contentContainer: {
        width: responsive.isWeb ? responsive.containerWidth : '100%',
        maxWidth: 1200,
    },
    shopCardContainer: {
        paddingHorizontal: responsive.isWeb && responsive.isDesktop ? 0 : SPACING.l,
    },
});