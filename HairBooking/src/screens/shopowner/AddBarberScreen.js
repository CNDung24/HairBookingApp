import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { COLORS, SPACING } from '../../theme';

const BarberSchema = Yup.object().shape({
    name: Yup.string().required('Tên thợ bắt buộc'),
    phone: Yup.string(),
    specialty: Yup.string(),
    experience: Yup.number(),
    bio: Yup.string(),
});

export const AddBarberScreen = ({ navigation }) => {
    const queryClient = useQueryClient();

    const addMutation = useMutation({
        mutationFn: (data) => client.post('/shop-owner/barbers', data),
        onSuccess: (res) => {
            Alert.alert('Thành công', 'Thêm thợ cắt tóc thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
            queryClient.invalidateQueries(['myBarbers']);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Thêm thất bại');
        }
    });

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Formik
                    initialValues={{
                        name: '',
                        phone: '',
                        specialty: '',
                        experience: '',
                        bio: '',
                        avatar: '',
                    }}
                    validationSchema={BarberSchema}
                    onSubmit={(values) => {
                        const data = {
                            ...values,
                            experience: values.experience ? parseInt(values.experience) : null,
                        };
                        addMutation.mutate(data);
                    }}
                >
                    {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
                        <View style={styles.form}>
                            <Input
                                label="Tên thợ *"
                                icon="person-outline"
                                value={values.name}
                                onChangeText={handleChange('name')}
                                error={touched.name && errors.name}
                                placeholder="Nhập tên thợ"
                            />

                            <Input
                                label="Số điện thoại"
                                icon="call-outline"
                                value={values.phone}
                                onChangeText={handleChange('phone')}
                                placeholder="Nhập số điện thoại"
                                keyboardType="phone-pad"
                            />

                            <Input
                                label="Chuyên môn"
                                icon="star-outline"
                                value={values.specialty}
                                onChangeText={handleChange('specialty')}
                                placeholder="Ví dụ: Cắt tóc nam, Nhuộm tóc"
                            />

                            <Input
                                label="Kinh nghiệm (năm)"
                                icon="time-outline"
                                value={values.experience}
                                onChangeText={handleChange('experience')}
                                placeholder="Số năm kinh nghiệm"
                                keyboardType="number-pad"
                            />

                            <Input
                                label="Giới thiệu"
                                icon="document-text-outline"
                                value={values.bio}
                                onChangeText={handleChange('bio')}
                                placeholder="Giới thiệu về thợ"
                                multiline
                                numberOfLines={3}
                            />

                            <Input
                                label="Avatar URL"
                                icon="image-outline"
                                value={values.avatar}
                                onChangeText={handleChange('avatar')}
                                placeholder="https://..."
                                autoCapitalize="none"
                            />

                            <Button 
                                title="Thêm thợ" 
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
    container: { flex: 1, backgroundColor: COLORS.background },
    form: { padding: SPACING.l },
});
