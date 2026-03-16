// src/components/ImagePickerButton.js
import React, { useState } from 'react';
import {
    View, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Text
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import client from '../api/client';
import { COLORS, SPACING, RADIUS } from '../theme';

export const ImagePickerButton = ({
    value,
    onChange,
    label = 'Chọn ảnh',
    multiple = false,
    style,
}) => {
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (multiple) {
                await uploadImages(result.assets);
            } else {
                await uploadImage(result.assets[0]);
            }
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần cấp quyền truy cập camera');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            if (multiple) {
                await uploadImages(result.assets);
            } else {
                await uploadImage(result.assets[0]);
            }
        }
    };

    const uploadImage = async (asset) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: asset.uri,
                type: asset.mimeType || 'image/jpeg',
                name: asset.fileName || 'image.jpg',
            });

            const response = await client.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                onChange(response.data.data.url);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const uploadImages = async (assets) => {
        setUploading(true);
        try {
            const formData = new FormData();
            assets.forEach((asset, index) => {
                formData.append('images', {
                    uri: asset.uri,
                    type: asset.mimeType || 'image/jpeg',
                    name: asset.fileName || `image_${index}.jpg`,
                });
            });

            const response = await client.post('/upload/images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                const urls = response.data.data.map(item => item.url);
                onChange(urls);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên');
        } finally {
            setUploading(false);
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Chọn ảnh',
            'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
            [
                { text: 'Chụp ảnh', onPress: takePhoto },
                { text: 'Thư viện', onPress: pickImage },
                { text: 'Hủy', style: 'cancel' },
            ]
        );
    };

    if (uploading) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang tải lên...</Text>
                </View>
            </View>
        );
    }

    if (multiple) {
        const images = Array.isArray(value) ? value : [];
        return (
            <View style={[styles.container, style]}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.imagesContainer}>
                    {images.map((url, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri: url }} style={styles.image} />
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => onChange(images.filter((_, i) => i !== index))}
                            >
                                <Icon name="close" size={16} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={showImageOptions}>
                        <Icon name="add" size={30} color={COLORS.textLight} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>{label}</Text>
            {value ? (
                <View style={styles.previewContainer}>
                    <Image source={{ uri: value }} style={styles.preview} />
                    <TouchableOpacity
                        style={styles.changeButton}
                        onPress={showImageOptions}
                    >
                        <Icon name="camera" size={20} color="#FFF" />
                        <Text style={styles.changeText}>Thay đổi</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.placeholder} onPress={showImageOptions}>
                    <Icon name="camera-outline" size={40} color={COLORS.textLight} />
                    <Text style={styles.placeholderText}>{label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.title,
        marginBottom: SPACING.s,
    },
    placeholder: {
        height: 150,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.m,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: SPACING.s,
        fontSize: 14,
        color: COLORS.textLight,
    },
    previewContainer: {
        position: 'relative',
    },
    preview: {
        width: '100%',
        height: 200,
        borderRadius: RADIUS.m,
    },
    changeButton: {
        position: 'absolute',
        bottom: SPACING.s,
        right: SPACING.s,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
    },
    changeText: {
        color: '#FFF',
        marginLeft: SPACING.xs,
        fontSize: 14,
    },
    loadingContainer: {
        height: 150,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.s,
        fontSize: 14,
        color: COLORS.textLight,
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    imageWrapper: {
        position: 'relative',
        marginRight: SPACING.s,
        marginBottom: SPACING.s,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: RADIUS.s,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 100,
        height: 100,
        backgroundColor: COLORS.background,
        borderRadius: RADIUS.s,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
