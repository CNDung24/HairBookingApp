import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SPACING } from '../theme';

const RegisterShopSchema = Yup.object().shape({
    name: Yup.string().required('Vui lòng nhập tên shop'),
    address: Yup.string().required('Vui lòng nhập địa chỉ'),
    city: Yup.string().required('Vui lòng nhập Tỉnh/TP'),
    phone: Yup.string().required('Vui lòng nhập số điện thoại'),
    email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    description: Yup.string(),
    openingTime: Yup.string().required('Vui lòng nhập giờ mở cửa'),
    closingTime: Yup.string().required('Vui lòng nhập giờ đóng cửa'),
});

export const RegisterShopScreen = ({ navigation }) => {
    const { registerShop } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.scrollContent}
                >
                    <TouchableOpacity activeOpacity={1} onPress={Keyboard.dismiss}>
                        <Text style={styles.title}>Đăng ký mở tiệm</Text>
                        <Text style={styles.subtitle}>Điền thông tin shop của bạn</Text>

                        <View style={styles.innerContainer}>
                            <Formik
                                initialValues={{
                                    name: '',
                                    address: '',
                                    city: '',
                                    phone: '',
                                    email: '',
                                    description: '',
                                    openingTime: '09:00',
                                    closingTime: '21:00',
                                    logo: '',
                                    image: '',
                                }}
                                validationSchema={RegisterShopSchema}
                                onSubmit={async (values, { setSubmitting }) => {
                                    try {
                                        await registerShop(values);
                                        Alert.alert(
                                            'Thành công',
                                            'Yêu cầu đăng ký shop đã được gửi. Vui lòng chờ admin duyệt.',
                                            [{ text: 'OK', onPress: () => navigation.goBack() }]
                                        );
                                    } catch (e) {
                                        Alert.alert('Lỗi', e.response?.data?.message || 'Đăng ký thất bại');
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
                                    <View style={styles.form}>
                                        <Text style={styles.sectionTitle}>Thông tin bắt buộc</Text>

                                        <Input
                                            label="Tên shop"
                                            icon="business-outline"
                                            value={values.name}
                                            onChangeText={handleChange('name')}
                                            error={touched.name && errors.name}
                                            placeholder="Nhập tên shop"
                                        />

                                        <Input
                                            label="Địa chỉ"
                                            icon="location-outline"
                                            value={values.address}
                                            onChangeText={handleChange('address')}
                                            error={touched.address && errors.address}
                                            placeholder="Nhập địa chỉ"
                                        />

                                        <Input
                                            label="Tỉnh / Thành phố"
                                            icon="map-outline"
                                            value={values.city}
                                            onChangeText={handleChange('city')}
                                            error={touched.city && errors.city}
                                            placeholder="Ví dụ: TP.HCM, Hà Nội"
                                        />

                                        <Input
                                            label="Số điện thoại"
                                            icon="call-outline"
                                            value={values.phone}
                                            onChangeText={handleChange('phone')}
                                            error={touched.phone && errors.phone}
                                            placeholder="Nhập số điện thoại"
                                            keyboardType="phone-pad"
                                        />

                                        <Input
                                            label="Email"
                                            icon="mail-outline"
                                            value={values.email}
                                            onChangeText={handleChange('email')}
                                            error={touched.email && errors.email}
                                            placeholder="Nhập email"
                                            autoCapitalize="none"
                                        />

                                        <View style={styles.row}>
                                            <View style={styles.halfInput}>
                                                <Input
                                                    label="Giờ mở cửa"
                                                    icon="time-outline"
                                                    value={values.openingTime}
                                                    onChangeText={handleChange('openingTime')}
                                                    error={touched.openingTime && errors.openingTime}
                                                    placeholder="09:00"
                                                />
                                            </View>
                                            <View style={styles.halfInput}>
                                                <Input
                                                    label="Giờ đóng cửa"
                                                    icon="time-outline"
                                                    value={values.closingTime}
                                                    onChangeText={handleChange('closingTime')}
                                                    error={touched.closingTime && errors.closingTime}
                                                    placeholder="21:00"
                                                />
                                            </View>
                                        </View>

                                        <Input
                                            label="Mô tả shop"
                                            icon="document-text-outline"
                                            value={values.description}
                                            onChangeText={handleChange('description')}
                                            error={touched.description && errors.description}
                                            placeholder="Mô tả về shop của bạn"
                                            multiline
                                            numberOfLines={3}
                                        />

                                        <Text style={styles.sectionTitle}>Thông tin thêm (tùy chọn)</Text>

                                        <Input
                                            label="Logo shop (URL)"
                                            icon="image-outline"
                                            value={values.logo}
                                            onChangeText={handleChange('logo')}
                                            error={touched.logo && errors.logo}
                                            placeholder="https://..."
                                            autoCapitalize="none"
                                        />

                                        <Input
                                            label="Ảnh cửa hàng (URL)"
                                            icon="image-outline"
                                            value={values.image}
                                            onChangeText={handleChange('image')}
                                            error={touched.image && errors.image}
                                            placeholder="https://..."
                                            autoCapitalize="none"
                                        />

                                        <Button
                                            title="Gửi yêu cầu đăng ký"
                                            onPress={handleSubmit}
                                            loading={isSubmitting}
                                        />

                                        <Button
                                            title="Hủy"
                                            onPress={() => navigation.goBack()}
                                            variant="outline"
                                        />
                                    </View>
                                )}
                            </Formik>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
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
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    innerContainer: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.secondary,
        marginTop: SPACING.xl,
        paddingHorizontal: SPACING.l,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: 8,
        marginBottom: SPACING.l,
        paddingHorizontal: SPACING.l,
    },
    form: {
        padding: SPACING.l,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.m,
        marginBottom: SPACING.s,
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.m,
    },
    halfInput: {
        flex: 1,
    },
});
