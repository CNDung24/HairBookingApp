import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View, Text, Image, TouchableOpacity, ScrollView,
    StyleSheet, StatusBar, Animated, FlatList, TextInput, Platform,
    useWindowDimensions, Modal, Alert, KeyboardAvoidingView, Keyboard
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';
import { Button } from '../components/Button';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../theme';

export const ShopDetailScreen = ({ route, navigation }) => {
    const { shopId } = route.params;
    const insets = useSafeAreaInsets();
    const { user } = useContext(AuthContext);
    const { height: screenHeight, width: screenWidth } = useWindowDimensions();
    const [selectedService, setSelectedService] = useState(null);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllStylists, setShowAllStylists] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const isWeb = Platform.OS === 'web';

    const { data: shop, isLoading } = useQuery({
        queryKey: ['shop', shopId],
        queryFn: async () => {
            const res = await client.get(`/shops/${shopId}`);
            return res.data;
        }
    });

    const { data: services } = useQuery({
        queryKey: ['services', shopId],
        queryFn: async () => (await client.get(`/shops/${shopId}/services`)).data.data
    });

    const { data: barbers } = useQuery({
        queryKey: ['barbers', shopId],
        queryFn: async () => (await client.get(`/shops/${shopId}/barbers`)).data.data
    });

    const { data: reviews } = useQuery({
        queryKey: ['reviews', shopId],
        queryFn: async () => (await client.get(`/shops/${shopId}/reviews`)).data.data,
        enabled: !!shopId
    });

    const filteredServices = services?.filter(s => {
        const matchesSearch = !searchQuery || s.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const displayedBarbers = showAllStylists ? barbers : barbers?.slice(0, 5);

    const handleBookPress = () => {
        if (!selectedService) return;
        navigation.navigate('Booking', {
            shop,
            service: selectedService,
            store_id: shopId,
            barber: selectedBarber
        });
    };

    const handleBarberSelect = (barber) => {
        setSelectedBarber(barber);
        setShowAllStylists(false);
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 150, 200],
        outputRange: [0, 0.5, 1],
        extrapolate: 'clamp',
    });

    const renderService = ({ item }) => {
        const isSelected = selectedService?.id === item.id;
        const hasDiscount = item.discountPrice && item.discountPrice < item.price;

        return (
            <TouchableOpacity
                style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                onPress={() => setSelectedService(item)}
                activeOpacity={0.8}
            >
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Icon name="checkmark" size={12} color="#FFF" />}
                </View>
                <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    <View style={styles.serviceMeta}>
                        <View style={styles.serviceDuration}>
                            <Icon name="time-outline" size={12} color={COLORS.textLight} />
                            <Text style={styles.serviceDurationText}>{item.duration} phút</Text>
                        </View>
                        {hasDiscount && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{Math.round((1 - item.discountPrice / item.price) * 100)}%</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.priceContainer}>
                    {hasDiscount && (
                        <Text style={styles.originalPrice}>{item.price.toLocaleString()}đ</Text>
                    )}
                    <Text style={styles.servicePrice}>
                        {(hasDiscount ? item.discountPrice : item.price).toLocaleString()}đ
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) return (
        <View style={styles.container}>
            <View style={styles.loadingContainer}>
                <Text style={{ color: COLORS.textLight }}>Đang tải dữ liệu...</Text>
            </View>
        </View>
    );

    if (!shop) return (
        <View style={styles.container}>
            <View style={styles.loadingContainer}>
                <Text style={{ color: COLORS.textLight }}>Không tìm thấy cửa hàng</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {!isWeb && (
                    <Animated.View pointerEvents="box-none" style={[styles.stickyHeader, { paddingTop: insets.top + 8, opacity: headerOpacity }]}>
                        <TouchableOpacity
                            style={styles.stickyBackButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={24} color={COLORS.title} />
                        </TouchableOpacity>
                        <Text style={styles.stickyTitle} numberOfLines={1}>{shop.name}</Text>
                        <TouchableOpacity style={styles.stickyActionButton}>
                            <Icon name="heart-outline" size={22} color={COLORS.title} />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.headerSection}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: shop?.image || 'https://via.placeholder.com/500' }}
                            style={styles.shopImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageOverlayDark} />
                        <View style={styles.imageOverlay}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Icon name="arrow-back" size={24} color="#FFF" />
                            </TouchableOpacity>
                            <View style={styles.topActions}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Icon name="share-social-outline" size={20} color="#FFF" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Icon name="heart-outline" size={20} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Header curves matching home screen style */}
                        <View style={styles.imageCurveBottom} />
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.nameRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.shopName}>{shop?.name}</Text>
                            </View>
                            <View style={styles.ratingBadge}>
                                <Icon name="star" size={14} color="#B68B63" />
                                <Text style={styles.ratingText}>{shop?.rating}</Text>
                                <Text style={styles.reviewCount}>({shop?.totalReviews || 156} đánh giá)</Text>
                            </View>
                        </View>
                        {shop?.description ? (
                            <Text style={styles.descriptionText}>{shop.description}</Text>
                        ) : (
                            <Text style={styles.descriptionText}>Tiệm cắt tóc nam cao cấp với không gian hiện đại</Text>
                        )}
                        <View style={styles.metaRowContainer}>
                            <View style={styles.addressRow}>
                                <Icon name="location-sharp" size={18} color="#B68B63" />
                                <Text style={styles.addressText}>{shop?.address}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <Icon name="time-outline" size={18} color="#B68B63" />
                                    <Text style={styles.metaText}>{shop?.openingTime || '09:00'} - {shop?.closingTime || '21:00'}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Icon name="navigate-outline" size={18} color="#B68B63" />
                                    <Text style={styles.distanceText}>{shop?.distance || '1.2'} km</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Icon name="search-outline" size={20} color={COLORS.title} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm dịch vụ, thợ..."
                            placeholderTextColor={COLORS.textLight}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Dịch vụ</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        {barbers?.length > 5 && (
                            <TouchableOpacity onPress={() => setShowAllStylists(true)}>
                                <Text style={styles.seeAll}>Xem tất cả ({barbers.length})</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.barberScrollContent}
                    >
                        {displayedBarbers?.length > 0 ? displayedBarbers.map((barber, index) => {
                            const isSelected = selectedBarber?.id === barber.id;
                            return (
                                <TouchableOpacity
                                    key={barber.id || index}
                                    style={[styles.barberCard, isSelected && styles.barberCardSelected]}
                                    onPress={() => setSelectedBarber(barber)}
                                >
                                    <View style={styles.barberAvatarContainer}>
                                        <Image
                                            source={{ uri: barber.avatar || 'https://i.pravatar.cc/150' }}
                                            style={styles.barberAvatar}
                                        />
                                        {isSelected && (
                                            <View style={styles.barberSelectedBadge}>
                                                <Icon name="checkmark" size={12} color="#FFF" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.barberName} numberOfLines={1}>{barber.name}</Text>
                                    <View style={styles.barberRating}>
                                        <Icon name="star" size={10} color={COLORS.primary} />
                                        <Text style={styles.barberRatingText}>{barber.rating}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }) : (
                            <Text style={styles.emptyText}>Chưa có stylist</Text>
                        )}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Danh sách dịch vụ</Text>
                    </View>
                </View>

                <View style={styles.servicesList}>
                    {filteredServices?.length > 0 ? (
                        filteredServices.map((service) => (
                            <View key={service.id}>
                                {renderService({ item: service })}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>Chưa có dịch vụ</Text>
                    )}
                </View>

                <View style={styles.reviewSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Đánh giá</Text>
                        <Text style={styles.seeAll}>Xem tất cả</Text>
                    </View>
                    {reviews?.length > 0 ? (
                        <View style={styles.reviewCard}>
                            {reviews.slice(0, 3).map((review, index) => (
                                <View key={review.id || index} style={[styles.reviewItem, index > 0 && styles.reviewItemBorder]}>
                                    <View style={styles.reviewHeader}>
                                        <Image
                                            source={{ uri: review.User?.avatar || 'https://i.pravatar.cc/150' }}
                                            style={styles.reviewAvatar}
                                        />
                                        <View style={styles.reviewInfo}>
                                            <Text style={styles.reviewUserName}>{review.User?.name || 'Khách hàng'}</Text>
                                            <View style={styles.reviewStars}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Icon
                                                        key={star}
                                                        name={star <= review.rating ? 'star' : 'star-outline'}
                                                        size={12}
                                                        color={COLORS.primary}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                        <Text style={styles.reviewDate}>
                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                                        </Text>
                                    </View>
                                    {review.comment && (
                                        <Text style={styles.reviewComment}>{review.comment}</Text>
                                    )}
                                    {review.reply && (
                                        <View style={styles.replyContainer}>
                                            <View style={styles.replyHeader}>
                                                <Icon name="storefront-outline" size={12} color={COLORS.primary} />
                                                <Text style={styles.replyLabel}> Phản hồi:</Text>
                                            </View>
                                            <Text style={styles.replyText}>{review.reply}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>Chưa có đánh giá</Text>
                    )}
                </View>

                <View style={styles.infoDetailSection}>
                    <Text style={styles.sectionTitle}>Thông tin</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Icon name="time-outline" size={20} color={COLORS.primary} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Giờ mở cửa</Text>
                                <Text style={styles.infoValue}>{shop?.openingTime || '09:00'} - {shop?.closingTime || '21:00'}</Text>
                            </View>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <Icon name="location-outline" size={20} color={COLORS.primary} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Địa chỉ</Text>
                                <Text style={styles.infoValue}>{shop?.address}</Text>
                            </View>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <Icon name="call-outline" size={20} color={COLORS.primary} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Liên hệ</Text>
                                <Text style={styles.infoValue}>{shop?.phone || 'Chưa cập nhật'}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
                <View style={styles.bottomBarContent}>
                    <View style={styles.priceInfo}>
                        <Text style={styles.priceLabel}>
                            Tổng cộng
                            {selectedBarber && <Text style={styles.barberLabel}> • {selectedBarber.name}</Text>}
                        </Text>
                        <Text style={styles.priceValue}>
                            {selectedService
                                ? (selectedService.discountPrice || selectedService.price || 0).toLocaleString()
                                : 0}
                            <Text style={styles.priceUnit}> vnđ</Text>
                        </Text>
                    </View>
                    <Button
                        title={user ? "Đặt Lịch Ngay" : "Đăng nhập để đặt"}
                        disabled={!selectedService}
                        onPress={handleBookPress}
                        style={styles.bookButton}
                    />
                </View>
            </View>

            <Modal visible={showAllStylists} animationType="slide" transparent keyboardShouldPersistTaps="handled">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Danh sách Stylist</Text>
                            <TouchableOpacity onPress={() => setShowAllStylists(false)}>
                                <Icon name="close" size={24} color={COLORS.title} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {barbers?.map((barber) => {
                                const isSelected = selectedBarber?.id === barber.id;
                                return (
                                    <TouchableOpacity
                                        key={barber.id}
                                        style={[styles.modalBarberItem, isSelected && styles.modalBarberItemSelected]}
                                        onPress={() => handleBarberSelect(barber)}
                                    >
                                        <Image
                                            source={{ uri: barber.avatar || 'https://i.pravatar.cc/150' }}
                                            style={styles.modalBarberAvatar}
                                        />
                                        <View style={styles.modalBarberInfo}>
                                            <Text style={styles.modalBarberName}>{barber.name}</Text>
                                            <Text style={styles.modalBarberSpecialty}>{barber.specialty || 'Stylist'}</Text>
                                            <View style={styles.modalBarberRating}>
                                                <Icon name="star" size={12} color={COLORS.primary} />
                                                <Text style={styles.modalBarberRatingText}>{barber.rating}</Text>
                                                <Text style={styles.modalBarberReviews}> • {barber.totalReviews || 0} đánh giá</Text>
                                            </View>
                                        </View>
                                        {isSelected && (
                                            <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9EB',
        ...(Platform.OS === 'web' && {
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden'
        }),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    headerSection: {
        marginBottom: SPACING.m,
        width: '100%',
    },
    imageContainer: {
        height: 280,
        position: 'relative',
        width: '100%',
        backgroundColor: COLORS.headerBackground || '#35434A',
    },
    imageOverlayDark: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    shopImage: {
        width: '100%',
        height: '100%',
    },
    imageCurveBottom: {
        position: 'absolute',
        bottom: -40,
        alignSelf: 'center',
        width: '150%',
        height: 100,
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 1000,
        borderTopRightRadius: 1000,
        zIndex: 2,
    },
    imageOverlay: {
        position: 'absolute',
        top: 50,
        left: SPACING.l,
        right: SPACING.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topActions: {
        flexDirection: 'row',
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },

    infoSection: {
        paddingHorizontal: SPACING.l,
        paddingBottom: SPACING.m,
        marginTop: 30, // pushed down slightly
        zIndex: 3,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    shopName: {
        fontSize: 26, // larger title
        fontWeight: '900',
        color: '#1A1A1A', // darker text
        lineHeight: 34,
        marginRight: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E5D8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
        marginTop: 6,
    },
    ratingText: {
        fontWeight: '800',
        color: '#B68B63',
        marginLeft: 4,
        fontSize: 14,
    },
    reviewCount: {
        fontSize: 12,
        color: '#888',
        marginLeft: 4,
    },
    descriptionText: {
        fontSize: 15,
        color: '#7B8D93',
        marginBottom: 20,
        lineHeight: 22,
    },
    metaRowContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 20,
        ...SHADOWS?.small,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center', // Fix vertical alignment
        marginBottom: 16,
    },
    addressText: {
        color: '#333',
        fontSize: 15,
        marginLeft: 12,
        flex: 1,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        width: '100%',
        marginBottom: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    metaText: {
        color: '#333',
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '500',
    },
    distanceText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },

    searchContainer: {
        paddingHorizontal: SPACING.l,
        marginBottom: 24, // increased margin
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF', // White background
        paddingVertical: 14, // Taller input
        paddingHorizontal: 20,
        borderRadius: 30, // Pill shaped
        borderWidth: 1,
        borderColor: '#E8E8E8', // Light grey border
        ...SHADOWS?.small,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#333',
    },

    section: {
        paddingHorizontal: SPACING.l,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20, // Larger title
        fontWeight: '900',
        color: '#1A1A1A',
        marginBottom: SPACING.m,
    },
    seeAll: {
        color: '#B68B63',
        fontWeight: '700',
        fontSize: 15,
    },

    barberScrollContent: {
        paddingRight: SPACING.l,
    },
    barberCard: {
        alignItems: 'center',
        marginRight: 20,
        width: 80, // slightly larger
    },
    barberAvatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    barberSelectedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#B68B63',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    barberAvatar: {
        width: 76,
        height: 76,
        borderRadius: 38, // Fully round
        borderWidth: 2,
        borderColor: '#E8E8E8', // Light grey border instead of box
    },
    barberName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
    },
    barberRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    barberRatingText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 4,
        fontWeight: '500',
    },

    servicesList: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    serviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16, // more generous padding
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...SHADOWS?.small, // soft shadow
    },
    serviceCardSelected: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primarySoft || '#FFF7ED',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: COLORS.textLight,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 15,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 4,
    },
    serviceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceDuration: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceDurationText: {
        fontSize: 12,
        color: COLORS.textLight,
        marginLeft: 4,
    },
    discountBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    discountText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.textLight,
        textDecorationLine: 'line-through',
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.primary,
    },

    infoDetailSection: {
        paddingHorizontal: SPACING.l,
        paddingBottom: 120,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    infoDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },

    emptyText: {
        color: COLORS.textLight,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: 20,
    },

    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingBottom: 12,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    stickyBackButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: COLORS.title,
        textAlign: 'center',
    },
    stickyActionButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    scrollView: {
        flex: 1,
        width: '100%', // take full container width
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 200,
    },
    scrollContentWeb: {
        paddingBottom: 100,
    },

    bottomBar: {
        position: Platform.OS === 'web' ? 'fixed' : 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        justifyContent: 'center', // responsiveness
        ...SHADOWS?.medium,
        zIndex: 1000,
    },
    priceInfo: {
        marginRight: SPACING.m,
        flex: 1, // ensure it takes space before button
    },
    bottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    priceValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.title,
    },
    priceUnit: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    bookButton: {
        flex: 1,
    },

    descriptionText: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
        lineHeight: 20,
    },
    barberLabel: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    originalPriceText: {
        fontSize: 14,
        color: COLORS.textLight,
        textDecorationLine: 'line-through',
        marginRight: 6,
    },
    discountText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },

    reviewSection: {
        paddingHorizontal: SPACING.l,
        marginBottom: SPACING.m,
    },
    reviewCard: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
    },
    reviewItem: {
        paddingVertical: SPACING.s,
    },
    reviewItemBorder: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginTop: SPACING.s,
        paddingTop: SPACING.s,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    reviewInfo: {
        flex: 1,
        marginLeft: 10,
    },
    reviewUserName: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    reviewStars: {
        flexDirection: 'row',
        marginTop: 2,
    },
    reviewDate: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    reviewComment: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 8,
        lineHeight: 18,
    },
    replyContainer: {
        backgroundColor: COLORS.primarySoft || '#FFF3E0',
        borderRadius: RADIUS.s,
        padding: SPACING.s,
        marginTop: 8,
        borderLeftWidth: 2,
        borderLeftColor: COLORS.primary,
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    replyLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.primary,
    },
    replyText: {
        fontSize: 12,
        color: COLORS.text,
        lineHeight: 16,
    },

    barberCardSelected: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderRadius: RADIUS.m,
        padding: 4,
    },
    barberAvatarContainer: {
        position: 'relative',
    },
    barberSelectedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.l,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.title,
    },
    modalScroll: {
        padding: SPACING.l,
    },
    modalBarberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        marginBottom: 10,
    },
    modalBarberItemSelected: {
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    modalBarberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    modalBarberInfo: {
        flex: 1,
        marginLeft: 12,
    },
    modalBarberName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    modalBarberSpecialty: {
        fontSize: 13,
        color: COLORS.textLight,
        marginTop: 2,
    },
    modalBarberRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    modalBarberRatingText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.text,
        marginLeft: 4,
    },
    modalBarberReviews: {
        fontSize: 12,
        color: COLORS.textLight,
    },
});
