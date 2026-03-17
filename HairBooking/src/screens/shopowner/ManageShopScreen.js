import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import client from '../../api/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { COLORS, SPACING, RADIUS } from '../../theme';

const ShopSchema = Yup.object().shape({
    name: Yup.string().required('Tên shop bắt buộc'),
    address: Yup.string().required('Địa chỉ bắt buộc'),
    city: Yup.string().required('Tỉnh/TP bắt buộc'),
    phone: Yup.string().required('SĐT bắt buộc'),
    email: Yup.string().email('Email không hợp lệ'),
    description: Yup.string(),
    openingTime: Yup.string(),
    closingTime: Yup.string(),
});

export const ManageShopScreen = ({ navigation }) => {
    const queryClient = useQueryClient();
    
    const { data: shop, isLoading } = useQuery({
        queryKey: ['myShop'],
        queryFn: async () => {
            const res = await client.get('/shop-owner/shop');
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => client.put('/shop-owner/shop', data),
        onSuccess: () => {
            Alert.alert('Thành công', 'Cập nhật thông tin shop thành công');
            queryClient.invalidateQueries(['myShop']);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Cập nhật thất bại');
        }
    });

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <Text>Đang tải...</Text>
            </View>
        );
    }

    if (!shop) {
        return (
            <View style={styles.loading}>
                <Ionicons name="business-outline" size={60} color={COLORS.textLight} />
                <Text style={styles.emptyText}>Bạn chưa có shop</Text>
                <Button 
                    title="Đăng ký shop" 
                    onPress={() => navigation.navigate('RegisterShop')} 
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Formik
                    initialValues={{
                        name: shop.name || '',
                        address: shop.address || '',
                        city: shop.city || '',
                        phone: shop.phone || '',
                        email: shop.email || '',
                        description: shop.description || '',
                        openingTime: shop.openingTime || '09:00',
                        closingTime: shop.closingTime || '21:00',
                        logo: shop.logo || '',
                        image: shop.image || '',
                    }}
                    validationSchema={ShopSchema}
                    onSubmit={(values) => updateMutation.mutate(values)}
                >
                    {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
                        <View style={styles.form}>
                            <View style={styles.imageSection}>
                                {values.logo ? (
                                    <Image source={{ uri: values.logo }} style={styles.logoImage} />
                                ) : (
                                    <View style={styles.logoPlaceholder}>
                                        <Ionicons name="image-outline" size={30} color={COLORS.textLight} />
                                    </View>
                                )}
                            </View>

                            <Input
                                label="Tên shop"
                                icon="business-outline"
                                value={values.name}
                                onChangeText={handleChange('name')}
                                error={touched.name && errors.name}
                            />

                            <Input
                                label="Địa chỉ"
                                icon="location-outline"
                                value={values.address}
                                onChangeText={handleChange('address')}
                                error={touched.address && errors.address}
                            />

                            <Input
                                label="Tỉnh / Thành phố"
                                icon="map-outline"
                                value={values.city}
                                onChangeText={handleChange('city')}
                                error={touched.city && errors.city}
                            />

                            <Input
                                label="Số điện thoại"
                                icon="call-outline"
                                value={values.phone}
                                onChangeText={handleChange('phone')}
                                error={touched.phone && errors.phone}
                                keyboardType="phone-pad"
                            />

                            <Input
                                label="Email"
                                icon="mail-outline"
                                value={values.email}
                                onChangeText={handleChange('email')}
                                error={touched.email && errors.email}
                                autoCapitalize="none"
                            />

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Input
                                        label="Giờ mở cửa"
                                        icon="time-outline"
                                        value={values.openingTime}
                                        onChangeText={handleChange('openingTime')}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Input
                                        label="Giờ đóng cửa"
                                        icon="time-outline"
                                        value={values.closingTime}
                                        onChangeText={handleChange('closingTime')}
                                    />
                                </View>
                            </View>

                            <Input
                                label="Mô tả"
                                icon="document-text-outline"
                                value={values.description}
                                onChangeText={handleChange('description')}
                                multiline
                                numberOfLines={3}
                            />

                            <Input
                                label="Logo URL"
                                icon="image-outline"
                                value={values.logo}
                                onChangeText={handleChange('logo')}
                                autoCapitalize="none"
                            />

                            <Input
                                label="Ảnh cửa hàng URL"
                                icon="image-outline"
                                value={values.image}
                                onChangeText={handleChange('image')}
                                autoCapitalize="none"
                            />

                            <Button 
                                title="Lưu thay đổi" 
                                onPress={handleSubmit} 
                                loading={isSubmitting || updateMutation.isPending}
                            />
                        </View>
                    )}
                </Formik>
            </ScrollView>
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
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
    emptyText: { fontSize: 16, color: COLORS.textLight, marginVertical: SPACING.m },
    form: { padding: SPACING.l },
    imageSection: { alignItems: 'center', marginBottom: SPACING.l },
    logoImage: { width: 100, height: 100, borderRadius: 50 },
    logoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
    row: { flexDirection: 'row', gap: SPACING.m },
    halfInput: { flex: 1 },
});
