import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, FlatList, StyleSheet, TextInput,
    TouchableOpacity, Keyboard, Animated, ActivityIndicator
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';
import { ShopCard } from '../components/ShopCard'; // Đảm bảo ShopCard đã được update
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

// Dữ liệu giả cho Filter Chips
const FILTERS = [
    { id: 'all', label: 'Tất cả' },
    { id: 'near', label: 'Gần tôi' },
    { id: 'rating', label: 'Đánh giá 4.5+' },
    { id: 'open', label: 'Đang mở' },
];

export const SearchScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [filteredShops, setFilteredShops] = useState([]);

    // Animation cho Header
    const scrollY = useRef(new Animated.Value(0)).current;

    const { data: shops, isLoading } = useQuery({
        queryKey: ['shops'],
        queryFn: async () => {
            // Giả lập delay để test loading
            // await new Promise(r => setTimeout(r, 1000));
            const res = await client.get('/shops');
            return res.data;
        }
    });

    // Logic lọc dữ liệu
    useEffect(() => {
        if (!shops) return;

        let result = shops;

        // 1. Lọc theo text
        if (searchQuery.trim() !== '') {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(shop =>
                shop.name.toLowerCase().includes(lowerQuery) ||
                shop.address.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Lọc theo Chips (Logic giả định)
        if (activeFilter === 'rating') {
            result = result.filter(shop => (shop.rating || 0) >= 4.5);
        }
        // Thêm logic cho 'near' và 'open' nếu có dữ liệu thực tế

        setFilteredShops(result);
    }, [searchQuery, shops, activeFilter]);

    // Component Header
    const renderHeader = () => (
        <View style={[styles.headerContainer, { paddingTop: insets.top + SPACING.s }]}>
            <Text style={styles.title}>Khám phá</Text>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <Icon name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm salon, barber, dịch vụ..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.textLight}
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Icon name="close-circle" size={20} color={COLORS.textLight} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <FlatList
                    horizontal
                    data={FILTERS}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: SPACING.m }}
                    renderItem={({ item }) => {
                        const isActive = activeFilter === item.id;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.chip,
                                    isActive && styles.chipActive
                                ]}
                                onPress={() => setActiveFilter(item.id)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    isActive && styles.chipTextActive
                                ]}>{item.label}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );

    // Component Empty State
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
                <Icon name="search-outline" size={40} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyText}>
                Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc.
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header cố định */}
            {renderHeader()}

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredShops}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={{ paddingHorizontal: SPACING.m }}>
                            <ShopCard
                                shop={item}
                                onPress={() => navigation.navigate('ShopDetail', { shopId: item.id })}
                            />
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmpty}
                    // Tối ưu hiệu năng
                    removeClippedSubviews={true}
                    initialNumToRender={5}
                    windowSize={5}
                    keyboardDismissMode="on-drag" // Ẩn bàn phím khi cuộn
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // Xám nhạt
    },

    // Header Styles
    headerContainer: {
        backgroundColor: COLORS.surface,
        paddingBottom: SPACING.m,
        borderBottomLeftRadius: RADIUS.l,
        borderBottomRightRadius: RADIUS.l,
        ...SHADOW, // Đổ bóng nhẹ cho header tách biệt khỏi list
        zIndex: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.title,
        marginLeft: SPACING.m,
        marginBottom: SPACING.m,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // Nền search xám nhạt
        marginHorizontal: SPACING.m,
        paddingHorizontal: 12,
        height: 50, // Cao hơn chuẩn cũ
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.title,
        height: '100%',
    },

    // Filter Chips Styles
    filterContainer: {
        // Không paddingHorizontal ở đây để scroll tràn viền
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: COLORS.primary, // Màu cam khi chọn
        // Shadow cho chip active
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    chipTextActive: {
        color: '#FFFFFF',
    },

    // List Styles
    listContent: {
        paddingTop: SPACING.m,
        paddingBottom: 100, // Để không bị che bởi tab bar
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Empty State Styles
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconBg: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: SPACING.m,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.title,
        marginBottom: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textLight,
        lineHeight: 20,
    },
});