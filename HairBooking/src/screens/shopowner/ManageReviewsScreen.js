import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageReviewsScreen = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [showReplyModal, setShowReplyModal] = useState(false);

    const fetchReviews = async () => {
        try {
            const response = await client.get('/shop-owner/reviews');
            setReviews(response.data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchReviews();
    };

    const handleReply = (review) => {
        setSelectedReview(review);
        setReplyText(review.reply || '');
        setShowReplyModal(true);
    };

    const submitReply = async () => {
        if (!replyText.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập nội dung phản hồi');
            return;
        }

        try {
            await client.post(`/shop-owner/reviews/${selectedReview.id}/reply`, { reply: replyText });
            Alert.alert('Thành công', 'Phản hồi đã được gửi');
            setShowReplyModal(false);
            fetchReviews();
        } catch (error) {
            console.error('Error replying:', error);
            Alert.alert('Lỗi', 'Không thể gửi phản hồi');
        }
    };

    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={16}
                        color={star <= rating ? COLORS.warning : COLORS.textLight}
                    />
                ))}
            </View>
        );
    };

    const renderReview = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.User?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.User?.name || 'Khách hàng'}</Text>
                        <Text style={styles.reviewDate}>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}
                        </Text>
                    </View>
                </View>
                {renderStars(item.rating)}
            </View>
            
            {item.Barber && (
                <Text style={styles.barberName}>Thợ: {item.Barber.name}</Text>
            )}
            
            <Text style={styles.reviewComment}>{item.comment}</Text>

            {item.images && item.images.length > 0 && (
                <View style={styles.imagesContainer}>
                    {item.images.map((img, idx) => (
                        <View key={idx} style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={24} color={COLORS.textLight} />
                        </View>
                    ))}
                </View>
            )}

            {item.reply ? (
                <View style={styles.replyContainer}>
                    <Text style={styles.replyLabel}>Phản hồi:</Text>
                    <Text style={styles.replyText}>{item.reply}</Text>
                    <Text style={styles.replyDate}>
                        {item.repliedAt ? new Date(item.repliedAt).toLocaleDateString('vi-VN') : ''}
                    </Text>
                </View>
            ) : (
                <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(item)}>
                    <Ionicons name="chatbubble-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.replyButtonText}>Phản hồi</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={reviews}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderReview}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            />

            <Modal visible={showReplyModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Phản hồi đánh giá</Text>
                        <TextInput
                            style={styles.replyInput}
                            placeholder="Nhập nội dung phản hồi..."
                            value={replyText}
                            onChangeText={setReplyText}
                            multiline
                            numberOfLines={4}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowReplyModal(false)}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={submitReply}>
                                <Text style={styles.submitButtonText}>Gửi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: SPACING.m, flexGrow: 1 },
    reviewCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: SPACING.m,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.s,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.s },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
    userName: { fontWeight: '600', fontSize: 14 },
    reviewDate: { fontSize: 12, color: COLORS.textLight },
    starsContainer: { flexDirection: 'row' },
    barberName: { fontSize: 13, color: COLORS.primary, marginBottom: SPACING.xs },
    reviewComment: { fontSize: 14, color: COLORS.text, marginBottom: SPACING.s },
    imagesContainer: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.s },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    replyContainer: {
        backgroundColor: COLORS.background,
        padding: SPACING.s,
        borderRadius: RADIUS.s,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    replyLabel: { fontWeight: '600', fontSize: 12, marginBottom: 4 },
    replyText: { fontSize: 13, color: COLORS.text },
    replyDate: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        paddingVertical: SPACING.xs,
    },
    replyButtonText: { color: COLORS.primary, fontWeight: '600' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginTop: SPACING.m },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.m,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.m,
        padding: SPACING.l,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: SPACING.m },
    replyInput: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.s,
        padding: SPACING.s,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.s, marginTop: SPACING.m },
    cancelButton: { paddingVertical: SPACING.s, paddingHorizontal: SPACING.m },
    cancelButtonText: { color: COLORS.textLight },
    submitButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.s,
        paddingHorizontal: SPACING.l,
        borderRadius: RADIUS.s,
    },
    submitButtonText: { color: COLORS.white, fontWeight: '600' },
});
