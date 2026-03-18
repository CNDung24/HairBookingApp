import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Image, Modal, Platform, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

export const ManageBannersScreen = ({ navigation }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        isActive: true,
        order: 0
    });

    const fetchBanners = async () => {
        try {
            const response = await client.get('/admin/banners');
            setBanners(response.data || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách banner');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBanners();
    };

    const handleAddBanner = async () => {
        if (!imageUrl.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập link ảnh banner');
            return;
        }

        // Validate URL format
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(imageUrl.trim())) {
            Alert.alert('Lỗi', 'Link ảnh không hợp lệ. Vui lòng nhập URL bắt đầu bằng http:// hoặc https://');
            return;
        }

        try {
            await client.post('/admin/banners', {
                ...form,
                image: imageUrl.trim(),
            });

            Alert.alert('Thành công', 'Thêm banner thành công');
            setShowAddModal(false);
            setImageUrl('');
            setForm({ title: '', description: '', isActive: true, order: 0 });
            fetchBanners();
        } catch (error) {
            console.error('Error adding banner:', error);
            Alert.alert('Lỗi', 'Không thể thêm banner');
        }
    };

    const handleDeleteBanner = (banner) => {
        Alert.alert(
            'Xóa banner',
            'Bạn có chắc muốn xóa banner này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/admin/banners/${banner.id}`);
                            Alert.alert('Thành công', 'Xóa banner thành công');
                            fetchBanners();
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa banner');
                        }
                    },
                },
            ]
        );
    };

    const handleToggleActive = async (banner) => {
        try {
            await client.put(`/admin/banners/${banner.id}`, {
                isActive: !banner.isActive,
            });
            fetchBanners();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái banner');
        }
    };

    const renderBannerItem = ({ item }) => (
        <View style={styles.bannerItem}>
            <Image
                source={{ uri: item.image }}
                style={styles.bannerImage}
            />
            <View style={styles.bannerInfo}>
                <Text style={styles.bannerTitle} numberOfLines={1}>
                    {item.title || 'Banner'}
                </Text>
                <View style={styles.bannerMeta}>
                    <Text style={styles.bannerOrder}>Thứ tự: {item.order}</Text>
                    <View style={styles.activeSwitch}>
                        <Text style={styles.activeLabel}>
                            {item.isActive ? 'Hiển thị' : 'Ẩn'}
                        </Text>
                        <Switch
                            value={item.isActive}
                            onValueChange={() => handleToggleActive(item)}
                            trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                            thumbColor={item.isActive ? COLORS.primary : '#f4f3f4'}
                        />
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteBanner(item)}
            >
                <Ionicons name="trash-outline" size={22} color={COLORS.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.title} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Banner</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
                    <Ionicons name="add" size={28} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={banners}
                renderItem={renderBannerItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="images-outline" size={64} color={COLORS.textLight} />
                        <Text style={styles.emptyText}>Chưa có banner nào</Text>
                        <TouchableOpacity
                            style={styles.addFirstButton}
                            onPress={() => setShowAddModal(true)}
                        >
                            <Text style={styles.addFirstText}>Thêm banner đầu tiên</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <Modal visible={showAddModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm Banner Mới</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.title} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Link ảnh banner *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập link ảnh (https://...)"
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            keyboardType="url"
                            autoCapitalize="none"
                        />

                        {imageUrl.trim() ? (
                            <View style={styles.imagePreview}>
                                <Image
                                    source={{ uri: imageUrl.trim() }}
                                    style={styles.previewImage}
                                    resizeMode="cover"
                                />
                            </View>
                        ) : (
                            <View style={styles.imagePreviewPlaceholder}>
                                <Ionicons name="image-outline" size={40} color={COLORS.textLight} />
                                <Text style={styles.imagePreviewText}>Preview sẽ hiển thị ở đây</Text>
                            </View>
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Tiêu đề (tùy chọn)"
                            value={form.title}
                            onChangeText={(text) => setForm({ ...form, title: text })}
                        />

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Mô tả (tùy chọn)"
                            value={form.description}
                            onChangeText={(text) => setForm({ ...form, description: text })}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Hiển thị banner</Text>
                            <Switch
                                value={form.isActive}
                                onValueChange={(value) => setForm({ ...form, isActive: value })}
                                trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                                thumbColor={form.isActive ? COLORS.primary : '#f4f3f4'}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleAddBanner}
                        >
                            <Text style={styles.submitButtonText}>Thêm Banner</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.m,
        paddingTop: Platform.OS === 'ios' ? 50 : SPACING.m,
        paddingBottom: SPACING.m,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.title,
    },
    addBtn: {
        padding: SPACING.xs,
    },
    listContent: {
        padding: SPACING.m,
    },
    bannerItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.m,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerImage: {
        width: 120,
        height: 80,
    },
    bannerInfo: {
        flex: 1,
        padding: SPACING.s,
        justifyContent: 'center',
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.title,
        marginBottom: 4,
    },
    bannerMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerOrder: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    activeSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginRight: 4,
    },
    deleteButton: {
        padding: SPACING.m,
        justifyContent: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: SPACING.m,
    },
    addFirstButton: {
        marginTop: SPACING.m,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
    },
    addFirstText: {
        color: '#FFF',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
        padding: SPACING.l,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.title,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.title,
        marginBottom: SPACING.xs,
    },
    imagePreview: {
        height: 150,
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        marginBottom: SPACING.m,
    },
    imagePreviewPlaceholder: {
        height: 150,
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        marginBottom: SPACING.m,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    imagePreviewText: {
        color: COLORS.textLight,
        marginTop: SPACING.s,
        fontSize: 12,
    },
    imagePicker: {
        height: 180,
        borderRadius: RADIUS.m,
        overflow: 'hidden',
        marginBottom: SPACING.m,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
    },
    imagePickerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    imagePickerText: {
        color: COLORS.textLight,
        marginTop: SPACING.s,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    input: {
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.s,
        padding: SPACING.m,
        fontSize: 14,
        marginBottom: SPACING.m,
        color: COLORS.text,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.title,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.m,
        borderRadius: RADIUS.s,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
