import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Image, KeyboardAvoidingView, Platform, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';
import { COLORS, SPACING, RADIUS } from '../theme';

export const ReviewScreen = ({ navigation, route }) => {
    const { booking } = route.params || {};
    const insets = useSafeAreaInsets();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!booking) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin đặt lịch');
            return;
        }

        setLoading(true);
        try {
            await client.post('/reviews', {
                bookingId: booking.id,
                barberId: booking.BarberId,
                shopId: booking.ShopId,
                rating,
                comment: comment.trim() || null
            });

            Alert.alert('Thành công', 'Cảm ơn bạn đã đánh giá!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể gửi đánh giá');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                    >
                        <Ionicons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={40}
                            color={star <= rating ? '#F59E0B' : COLORS.textLight}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const getRatingText = () => {
        switch (rating) {
            case 1: return 'Rất tệ';
            case 2: return 'Tệ';
            case 3: return 'Bình thường';
            case 4: return 'Tốt';
            case 5: return 'Rất tốt';
            default: return '';
        }
    };

    if (!booking) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text>Không tìm thấy thông tin đặt lịch</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
        >
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.title} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Đánh giá dịch vụ</Text>
                    <View style={styles.backButton} />
                </View>

                <ScrollView 
                    contentContainerStyle={styles.content} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss}>
                        <View style={styles.bookingInfo}>
                            <Text style={styles.shopName}>{booking.Shop?.name}</Text>
                            <Text style={styles.serviceName}>{booking.Service?.name}</Text>
                            <Text style={styles.bookingDate}>
                                Ngày {booking.booking_date} lúc {booking.booking_time}
                            </Text>
                        </View>

                        <View style={styles.ratingSection}>
                            <Text style={styles.sectionTitle}>Bạn cảm thấy dịch vụ như thế nào?</Text>
                            {renderStars()}
                            <Text style={styles.ratingText}>{getRatingText()}</Text>
                        </View>

                        <View style={styles.commentSection}>
                            <Text style={styles.sectionTitle}>Nhận xét của bạn (không bắt buộc)</Text>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Chia sẻ trải nghiệm của bạn..."
                                placeholderTextColor={COLORS.textLight}
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>
                                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
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
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.title,
        textAlign: 'center',
    },
    content: {
        padding: SPACING.l,
    },
    bookingInfo: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.l,
        marginBottom: SPACING.l,
    },
    shopName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.title,
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 4,
    },
    bookingDate: {
        fontSize: 13,
        color: COLORS.textLight,
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.title,
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.s,
    },
    starButton: {
        padding: SPACING.xs,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F59E0B',
    },
    commentSection: {
        marginBottom: SPACING.l,
    },
    commentInput: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        fontSize: 14,
        color: COLORS.text,
        minHeight: 100,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.l,
        paddingVertical: SPACING.m,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
