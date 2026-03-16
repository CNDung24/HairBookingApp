// src/screens/BookingScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Alert,
    TouchableOpacity, StatusBar, SafeAreaView, Image, Platform
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/Button';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';

export const BookingScreen = ({ route, navigation }) => {
    const { shop, service, barber: preselectedBarber } = route.params;
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedBarberId, setSelectedBarberId] = useState(preselectedBarber?.id || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    useEffect(() => {
        if (!user) {
            Alert.alert(
                'Chưa đăng nhập',
                'Vui lòng đăng nhập để đặt lịch',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }
    }, [user]);

    const { data: barbers } = useQuery({
        queryKey: ['barbers', shop.id],
        queryFn: async () => (await client.get(`/shops/${shop.id}/barbers`)).data.data
    });

    const { data: availableSlotsData, refetch: refetchSlots } = useQuery({
        queryKey: ['availableSlots', selectedBarberId, selectedDate],
        queryFn: async () => {
            if (!selectedBarberId || !selectedDate) return { data: [] };
            const response = await client.get(`/bookings/slots?barberId=${selectedBarberId}&date=${selectedDate}`);
            return response.data;
        },
        enabled: !!selectedBarberId && !!selectedDate
    });

    const timeSlots = availableSlotsData?.data || [];

    useEffect(() => {
        if (preselectedBarber?.id) {
            setSelectedBarberId(preselectedBarber.id);
        } else if (barbers?.length > 0 && !selectedBarberId) {
            setSelectedBarberId(barbers[0].id);
        }
    }, [barbers, preselectedBarber]);

    const currentBarber = barbers?.find(b => b.id === selectedBarberId) || preselectedBarber;

    const handleBooking = async () => {
        if (!selectedBarberId) {
            Alert.alert('Lỗi', 'Vui lòng chọn thợ cắt');
            return;
        }

        if (!selectedDate) {
            Alert.alert('Lỗi', 'Vui lòng chọn ngày');
            return;
        }

        if (!selectedTime) {
            Alert.alert('Lỗi', 'Vui lòng chọn giờ');
            return;
        }

        setIsSubmitting(true);
        try {
            const bookingData = {
                barberId: selectedBarberId,
                booking_date: selectedDate,
                booking_time: selectedTime,
                ShopId: shop.id,
                ServiceId: service.id
            };

            console.log('Booking data:', bookingData);
            
            const response = await client.post('/bookings', bookingData);
            console.log('Booking response status:', response.status);
            console.log('Booking response data:', response.data);

            setBookingSuccess(true);
            setBookingResult({
                service: service.name,
                date: selectedDate,
                time: selectedTime,
                barber: currentBarber?.name || 'Chưa chọn'
            });
        } catch (error) {
            console.log('Booking error:', error);
            console.log('Error response:', error.response?.data);
            const msg = error.response?.data?.message || error.message || 'Đã xảy ra lỗi';
            Alert.alert('Lỗi', msg);
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- HẾT PHẦN LOGIC CŨ ---

    // --- GIAO DIỆN MỚI ---
    
    // Hiển thị màn hình thành công
    if (bookingSuccess && bookingResult) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
                <View style={styles.successContainer}>
                    <View style={styles.successIcon}>
                        <Icon name="checkmark-circle" size={80} color={COLORS.primary} />
                    </View>
                    <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
                    <View style={styles.successDetails}>
                        <View style={styles.successRow}>
                            <Icon name="cut" size={20} color={COLORS.textLight} />
                            <Text style={styles.successLabel}>Dịch vụ:</Text>
                            <Text style={styles.successValue}>{bookingResult.service}</Text>
                        </View>
                        <View style={styles.successRow}>
                            <Icon name="calendar" size={20} color={COLORS.textLight} />
                            <Text style={styles.successLabel}>Ngày:</Text>
                            <Text style={styles.successValue}>{bookingResult.date}</Text>
                        </View>
                        <View style={styles.successRow}>
                            <Icon name="time" size={20} color={COLORS.textLight} />
                            <Text style={styles.successLabel}>Giờ:</Text>
                            <Text style={styles.successValue}>{bookingResult.time}</Text>
                        </View>
                        <View style={styles.successRow}>
                            <Icon name="person" size={20} color={COLORS.textLight} />
                            <Text style={styles.successLabel}>Thợ:</Text>
                            <Text style={styles.successValue}>{bookingResult.barber}</Text>
                        </View>
                    </View>
                    <Button
                        title="Xem lịch hẹn của tôi"
                        onPress={() => {
                            navigation.reset({
                                index: 1,
                                routes: [
                                    { name: 'CustomerTabs' },
                                    { name: 'MyBookings' },
                                ],
                            });
                        }}
                        style={styles.successButton}
                    />
                    <Button
                        title="Về trang chủ"
                        variant="outline"
                        onPress={() => {
                            navigation.reset({
                                index: 0,
                                routes: [
                                    { name: 'CustomerTabs' },
                                ],
                            });
                        }}
                        style={styles.homeButton}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Service Summary Card */}
                <View style={styles.summaryCard}>
                    <View style={styles.shopIcon}>
                        <Icon name="cut" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.shopName}>{shop.name} • {shop.address}</Text>
                    </View>
                    <Text style={styles.price}>{service.discountPrice 
                        ? service.discountPrice.toLocaleString() 
                        : service.price.toLocaleString()}đ</Text>
                </View>

                {/* 1.5. Barber Selection */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Chọn thợ cắt</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {barbers?.map((barber) => {
                            const isSelected = selectedBarberId === barber.id;
                            return (
                                <TouchableOpacity
                                    key={barber.id}
                                    style={[styles.barberCard, isSelected && styles.barberCardSelected]}
                                    onPress={() => setSelectedBarberId(barber.id)}
                                >
                                    <Image
                                        source={{ uri: barber.avatar || 'https://i.pravatar.cc/150' }}
                                        style={styles.barberAvatar}
                                    />
                                    <Text style={styles.barberName} numberOfLines={1}>{barber.name}</Text>
                                    <View style={styles.barberRating}>
                                        <Icon name="star" size={10} color={COLORS.primary} />
                                        <Text style={styles.barberRatingText}>{barber.rating || 4.8}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                    {currentBarber && (
                        <View style={styles.selectedBarberInfo}>
                            <Icon name="person" size={16} color={COLORS.primary} />
                            <Text style={styles.selectedBarberText}>
                                Đã chọn: {currentBarber.name}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 2. Calendar Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Chọn ngày</Text>
                    <View style={styles.calendarWrapper}>
                        <Calendar
                            onDayPress={day => setSelectedDate(day.dateString)}
                            markedDates={{
                                [selectedDate]: {
                                    selected: true,
                                    selectedColor: COLORS.primary,
                                    selectedTextColor: '#FFF'
                                }
                            }}
                            minDate={new Date().toISOString().split('T')[0]}
                            theme={{
                                backgroundColor: '#ffffff',
                                calendarBackground: '#ffffff',
                                textSectionTitleColor: '#b6c1cd',
                                selectedDayBackgroundColor: COLORS.primary,
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: COLORS.primary,
                                dayTextColor: '#2d4150',
                                textDisabledColor: '#d9e1e8',
                                arrowColor: COLORS.primary,
                                monthTextColor: COLORS.title || '#000',
                                textDayFontWeight: '500',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '500',
                                textDayFontSize: 16,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 14
                            }}
                        />
                    </View>
                </View>

                {/* 3. Time Slot Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Chọn giờ</Text>
                    {selectedDate && timeSlots.length > 0 ? (
                        <View style={styles.timeGrid}>
                            {timeSlots.map(time => {
                                const isSelected = selectedTime === time;
                                return (
                                    <TouchableOpacity
                                        key={time}
                                        style={[
                                            styles.timeSlot,
                                            isSelected && styles.timeSlotActive
                                        ]}
                                        onPress={() => setSelectedTime(time)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.timeText,
                                            isSelected && styles.timeTextActive
                                        ]}>
                                            {time}
                                        </Text>
                                        {isSelected && (
                                            <Icon
                                                name="checkmark-circle"
                                                size={16}
                                                color="#FFF"
                                                style={styles.checkIcon}
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : selectedDate ? (
                        <View style={styles.noSlotsContainer}>
                            <Icon name="calendar-outline" size={40} color={COLORS.textLight} />
                            <Text style={styles.noSlotsText}>
                                {selectedBarberId 
                                    ? 'Không có slot trống cho ngày này'
                                    : 'Vui lòng chọn thợ cắt trước'
                                }
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.noSlotsContainer}>
                            <Icon name="calendar-outline" size={40} color={COLORS.textLight} />
                            <Text style={styles.noSlotsText}>Vui lòng chọn ngày trước</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* 4. Footer Action */}
            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerLabel}>Tổng cộng</Text>
                    <Text style={styles.footerPrice}>
                        {service.discountPrice 
                            ? service.discountPrice.toLocaleString() 
                            : service.price.toLocaleString()}đ
                    </Text>
                </View>
                <View style={styles.footerButtonContainer}>
                    <Button
                        title="Xác nhận đặt lịch"
                        onPress={handleBooking}
                        loading={isSubmitting}
                        disabled={!selectedDate || !selectedTime || !selectedBarberId}
                    />
                </View>
            </View>
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
            overflow: 'hidden' 
        }),
    },
    scrollContent: { padding: SPACING.l, paddingBottom: 100 },

    // Summary Card
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.l,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...SHADOW,
        shadowOpacity: 0.05,
    },
    shopIcon: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primarySoft || '#FFE4D6',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    serviceName: { fontSize: 16, fontWeight: '700', color: COLORS.title || '#333' },
    shopName: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
    price: { fontSize: 18, fontWeight: '800', color: COLORS.primary },

    // Sections
    sectionContainer: { marginBottom: SPACING.l },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title || '#333', marginBottom: 12 },

    // Calendar Styling
    calendarWrapper: {
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...SHADOW,
        shadowOpacity: 0.05,
        backgroundColor: COLORS.surface,
    },

    // Time Slots Styling
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    timeSlot: {
        width: '30%', // Chia 3 cột
        paddingVertical: 12,
        borderRadius: RADIUS.s,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    timeSlotActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        ...SHADOW,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.3,
    },
    timeText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
    timeTextActive: { color: '#FFF' },
    checkIcon: { marginLeft: 4 },
    noSlotsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
    },
    noSlotsText: {
        marginTop: SPACING.m,
        fontSize: 14,
        color: COLORS.textLight,
        textAlign: 'center',
    },

    // Footer Styling
    footer: {
        position: Platform.OS === 'web' ? 'fixed' : 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOW,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        elevation: 10,
        zIndex: 1000,
    },
    footerInfo: { flex: 1 },
    footerLabel: { fontSize: 12, color: COLORS.textLight },
    footerPrice: { fontSize: 20, fontWeight: '800', color: COLORS.title || '#333' },
    footerButtonContainer: { flex: 1.5 },
    originalPrice: {
        fontSize: 12,
        color: COLORS.textLight,
        textDecorationLine: 'line-through',
    },
    discountBadge: {
        fontSize: 11,
        color: COLORS.primary,
        fontWeight: '600',
        backgroundColor: COLORS.primarySoft || '#FFE4D6',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 2,
    },

    barberCard: {
        alignItems: 'center',
        marginRight: 16,
        width: 75,
        padding: 8,
        borderRadius: RADIUS.m,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    barberCardSelected: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primarySoft || '#FFE4D6',
    },
    barberAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 4,
    },
    barberName: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
    },
    barberRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    barberRatingText: {
        fontSize: 10,
        color: COLORS.textLight,
        marginLeft: 2,
    },
    selectedBarberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        padding: 8,
        backgroundColor: COLORS.primarySoft || '#FFE4D6',
        borderRadius: RADIUS.s,
    },
    selectedBarberText: {
        marginLeft: 6,
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 13,
    },

    // Success Screen
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    successIcon: {
        marginBottom: SPACING.l,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: COLORS.title,
        marginBottom: SPACING.l,
    },
    successDetails: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.l,
        width: '100%',
        marginBottom: SPACING.l,
    },
    successRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    successLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        marginLeft: 10,
        width: 70,
    },
    successValue: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
    },
    successButton: {
        width: '100%',
        marginBottom: SPACING.m,
    },
    homeButton: {
        width: '100%',
    },
});