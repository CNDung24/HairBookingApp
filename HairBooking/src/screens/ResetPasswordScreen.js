// src/screens/ResetPasswordScreen.js
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Alert, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import client from '../api/client';
import { COLORS, SPACING, RADIUS } from '../theme';

export const ResetPasswordScreen = ({ route, navigation }) => {
    const { token } = route.params || {};
    const isResetMode = !!token;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const forgotMutation = useMutation({
        mutationFn: async (email) => {
            const response = await client.post('/auth/forgot-password', { email });
            return response.data;
        },
        onSuccess: (data) => {
            Alert.alert('Thành công', data.message);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || error.message);
        }
    });

    const resetMutation = useMutation({
        mutationFn: async ({ token, password }) => {
            const response = await client.post('/auth/reset-password', { token, newPassword: password });
            return response.data;
        },
        onSuccess: (data) => {
            Alert.alert('Thành công', data.message, [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || error.message);
        }
    });

    const handleForgotPassword = () => {
        if (!email) {
            Alert.alert('Lỗi', 'Vui lòng nhập email');
            return;
        }
        forgotMutation.mutate(email);
    };

    const handleResetPassword = () => {
        if (!password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu không khớp');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        resetMutation.mutate({ token, password });
    };

    if (isResetMode) {
        return (
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Icon name="lock-closed" size={60} color={COLORS.primary} />
                        <Text style={styles.title}>Đặt lại mật khẩu</Text>
                        <Text style={styles.subtitle}>Nhập mật khẩu mới của bạn</Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Mật khẩu mới"
                            placeholder="Nhập mật khẩu mới"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />
                        <Input
                            label="Xác nhận mật khẩu"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                        />
                        <Button
                            title="Đặt lại mật khẩu"
                            onPress={handleResetPassword}
                            loading={resetMutation.isPending}
                            style={styles.button}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Icon name="key" size={60} color={COLORS.primary} />
                    <Text style={styles.title}>Quên mật khẩu</Text>
                    <Text style={styles.subtitle}>Nhập email để nhận link đặt lại mật khẩu</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        leftIcon="mail-outline"
                    />
                    <Button
                        title="Gửi link đặt lại"
                        onPress={handleForgotPassword}
                        loading={forgotMutation.isPending}
                        style={styles.button}
                    />
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={20} color={COLORS.primary} />
                        <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: SPACING.l,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.title,
        marginTop: SPACING.m,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: SPACING.s,
        textAlign: 'center',
    },
    form: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.l,
    },
    button: {
        marginTop: SPACING.m,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SPACING.l,
    },
    backButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: SPACING.s,
    },
});
