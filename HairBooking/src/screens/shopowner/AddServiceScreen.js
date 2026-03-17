import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { COLORS, SPACING } from '../../theme';

const ServiceSchema = Yup.object().shape({
    name: Yup.string().required('Tên dịch vụ bắt buộc'),
    price: Yup.number().required('Giá bắt buộc').positive('Giá phải lớn hơn 0'),
    duration: Yup.number().required('Thời gian bắt buộc').positive('Thời gian phải lớn hơn 0'),
    category: Yup.string(),
});

export const AddServiceScreen = ({ navigation }) => {
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: (data) => client.post('/shop-owner/services', data),
        onSuccess: () => {
            Alert.alert('Thành công', 'Thêm dịch vụ thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
            queryClient.invalidateQueries(['myServices']);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Thêm thất bại');
        }
    });

    const categories = ['Cắt tóc', 'Nhuộm', 'Uốn', 'Gội đầu', 'Shave', 'Spa', 'Khác'];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Formik
                    initialValues={{
                        name: '',
                        description: '',
                        price: '',
                        duration: '',
                        category: 'Cắt tóc',
                        isPopular: false,
                        image: '',
                    }}
                    validationSchema={ServiceSchema}
                    onSubmit={(values) => {
                        const data = {
                            ...values,
                            price: parseFloat(values.price),
                            duration: parseInt(values.duration),
                        };
                        addMutation.mutate(data);
                    }}
                >
                    {({ handleChange, handleSubmit, values, errors, touched, isSubmitting, setFieldValue }) => (
                        <View style={styles.form}>
                            <Input
                                label="Tên dịch vụ *"
                                icon="cut-outline"
                                value={values.name}
                                onChangeText={handleChange('name')}
                                error={touched.name && errors.name}
                                placeholder="Ví dụ: Cắt tóc nam"
                            />

                            <Input
                                label="Mô tả"
                                icon="document-text-outline"
                                value={values.description}
                                onChangeText={handleChange('description')}
                                placeholder="Mô tả dịch vụ"
                                multiline
                                numberOfLines={3}
                            />

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Input
                                        label="Giá (VND) *"
                                        icon="cash-outline"
                                        value={values.price}
                                        onChangeText={handleChange('price')}
                                        error={touched.price && errors.price}
                                        placeholder="100000"
                                        keyboardType="number-pad"
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Input
                                        label="Thời gian (phút) *"
                                        icon="time-outline"
                                        value={values.duration}
                                        onChangeText={handleChange('duration')}
                                        error={touched.duration && errors.duration}
                                        placeholder="30"
                                        keyboardType="number-pad"
                                    />
                                </View>
                            </View>

                            <Input
                                label="Loại dịch vụ"
                                icon="grid-outline"
                                value={values.category}
                                onChangeText={handleChange('category')}
                                placeholder="Cắt tóc, Nhuộm, ..."
                            />

                            <Input
                                label="Hình ảnh URL"
                                icon="image-outline"
                                value={values.image}
                                onChangeText={handleChange('image')}
                                placeholder="https://..."
                                autoCapitalize="none"
                            />

                            <Button 
                                title="Thêm dịch vụ" 
                                onPress={handleSubmit} 
                                loading={isSubmitting || addMutation.isPending}
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
    form: { padding: SPACING.l },
    row: { flexDirection: 'row', gap: SPACING.m },
    halfInput: { flex: 1 },
});
