// src/screens/admin/CreateBarberScreen.js
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Alert, ScrollView,
    TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../theme';

const Schema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên thợ'),
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    password: Yup.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').required('Vui lòng nhập mật khẩu'),
    shopId: Yup.number().required('Vui lòng chọn cửa hàng')
});

export const CreateBarberScreen = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);

    const { data: shops } = useQuery({
        queryKey: ['admin-shops'],
        queryFn: async () => (await client.get('/admin/shops')).data
    });

    const handleSubmit = async (values) => {
        try {
            await client.post('/admin/barbers', values);
            Alert.alert('Thành công', 'Đã tạo tài khoản Barber mới', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo tài khoản');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-back" size={24} color={COLORS.title} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thêm Barber Mới</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Formik
                    initialValues={{ name: '', email: '', password: '', shopId: '', avatar: 'https://via.placeholder.com/150' }}
                    validationSchema={Schema}
                    onSubmit={handleSubmit}
                >
                    {({ handleChange, handleSubmit, setFieldValue, values, errors, touched }) => (
                        <View>
                            <View style={styles.avatarSection}>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Icon name="person" size={40} color={COLORS.primary} />
                                    </View>
                                    <TouchableOpacity style={styles.cameraBtn}>
                                        <Icon name="camera" size={14} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.uploadText}>Ảnh đại diện</Text>
                            </View>

                            <View style={styles.formCard}>
                                <Input
                                    label="Họ tên"
                                    placeholder="Nguyễn Văn A"
                                    value={values.name}
                                    onChangeText={handleChange('name')}
                                    error={touched.name && errors.name}
                                    icon="person-outline"
                                />
                                <Input
                                    label="Email đăng nhập"
                                    placeholder="barber@example.com"
                                    value={values.email}
                                    onChangeText={handleChange('email')}
                                    error={touched.email && errors.email}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon="mail-outline"
                                />
                                <View style={{ position: 'relative' }}>
                                    <Input
                                        label="Mật khẩu"
                                        placeholder="••••••"
                                        value={values.password}
                                        onChangeText={handleChange('password')}
                                        secureTextEntry={!showPassword}
                                        error={touched.password && errors.password}
                                        icon="lock-closed-outline"
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Icon name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textLight} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.shopSection}>
                                <Text style={styles.sectionLabel}>
                                    Chọn cửa hàng làm việc <Text style={{ color: 'red' }}>*</Text>
                                </Text>
                                {touched.shopId && errors.shopId && (
                                    <Text style={styles.errorText}>{errors.shopId}</Text>
                                )}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                                    {shops?.map((shop) => {
                                        const isSelected = values.shopId === shop.id;
                                        return (
                                            <TouchableOpacity
                                                key={shop.id}
                                                style={[styles.shopCard, isSelected && styles.shopCardActive]}
                                                onPress={() => setFieldValue('shopId', shop.id)}
                                            >
                                                <View style={[styles.shopIcon, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                                    <Icon name="business" size={20} color={isSelected ? '#FFF' : COLORS.primary} />
                                                </View>
                                                <View>
                                                    <Text style={[styles.shopName, isSelected && { color: '#FFF' }]}>{shop.name}</Text>
                                                    <Text style={[styles.shopAddress, isSelected && { color: 'rgba(255,255,255,0.8)' }]}>{shop.address}</Text>
                                                </View>
                                                {isSelected && (
                                                    <View style={styles.checkBadge}>
                                                        <Icon name="checkmark" size={10} color={COLORS.primary} />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        )
                                    })}
                                </ScrollView>
                            </View>

                            <View style={styles.footer}>
                                <Button
                                    title="Tạo tài khoản Barber"
                                    onPress={handleSubmit}
                                />
                            </View>
                        </View>
                    )}
                </Formik>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.l, paddingTop: Platform.OS === 'android' ? 40 : 60, paddingBottom: SPACING.m,
        backgroundColor: COLORS.background
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: '#F3F4F6'
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
    scrollContent: { padding: SPACING.l },
    avatarSection: { alignItems: 'center', marginBottom: SPACING.l },
    avatarContainer: { position: 'relative', marginBottom: 8 },
    avatarPlaceholder: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#F3F4F6', borderStyle: 'dashed'
    },
    cameraBtn: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: COLORS.primary, width: 24, height: 24, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF'
    },
    uploadText: { fontSize: 13, color: COLORS.textLight, fontWeight: '500' },
    formCard: {
        backgroundColor: COLORS.surface, padding: SPACING.m, borderRadius: RADIUS.m,
        ...SHADOW, shadowOpacity: 0.05, marginBottom: SPACING.l
    },
    eyeIcon: { position: 'absolute', right: 12, top: 48 },
    shopSection: { marginBottom: SPACING.xl },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.title, marginBottom: 4 },
    shopCard: {
        width: 160, padding: 12, marginRight: 12,
        backgroundColor: COLORS.surface, borderRadius: RADIUS.m,
        borderWidth: 1, borderColor: '#F3F4F6',
    },
    shopCardActive: {
        backgroundColor: COLORS.primary, borderColor: COLORS.primary,
        ...SHADOW, shadowColor: COLORS.primary, shadowOpacity: 0.3
    },
    shopIcon: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primarySoft || '#FFE4D6',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8
    },
    shopName: { fontSize: 13, fontWeight: '700', color: COLORS.title, marginBottom: 2 },
    shopAddress: { fontSize: 11, color: COLORS.textLight },
    checkBadge: {
        position: 'absolute', top: 8, right: 8,
        width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFF',
        justifyContent: 'center', alignItems: 'center'
    },
    errorText: { color: 'red', fontSize: 12, marginBottom: 5 },
    footer: { marginBottom: 20 }
});
