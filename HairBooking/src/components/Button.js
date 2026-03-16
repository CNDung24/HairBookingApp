import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../theme';

export const Button = ({
    title,
    onPress,
    loading = false,
    variant = 'primary', // primary | secondary | outline | ghost | danger
    icon,                // Icon component (nếu có)
    style,
    textStyle,
    disabled = false
}) => {
    // 1. Logic chọn màu sắc dựa trên variant
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    container: {
                        backgroundColor: COLORS.primary,
                        borderWidth: 0,
                        // Bóng đổ màu cam (Glow effect)
                        shadowColor: COLORS.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 6,
                    },
                    text: { color: '#FFFFFF' }
                };
            case 'secondary':
                return {
                    container: { backgroundColor: COLORS.primarySoft, borderWidth: 0 },
                    text: { color: COLORS.primaryDark }
                };
            case 'outline':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: COLORS.border
                    },
                    text: { color: COLORS.text }
                };
            case 'danger':
                return {
                    container: { backgroundColor: COLORS.errorLight, borderWidth: 0 },
                    text: { color: COLORS.error }
                };
            case 'ghost':
                return {
                    container: { backgroundColor: 'transparent', borderWidth: 0, elevation: 0 },
                    text: { color: COLORS.textLight } // Màu xám nhạt cho nút phụ
                };
            default:
                return {
                    container: { backgroundColor: COLORS.primary },
                    text: { color: '#FFFFFF' }
                };
        }
    };

    const stylesConfig = getVariantStyles();
    const isDisabled = loading || disabled;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                stylesConfig.container,
                isDisabled && styles.disabled, // Style khi bị disable
                style
            ]}
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7} // Độ mờ khi bấm
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#FFF'}
                />
            ) : (
                <View style={styles.contentContainer}>
                    {/* Render Icon nếu có (bên trái text) */}
                    {icon && <View style={styles.iconWrapper}>{icon}</View>}

                    <Text style={[styles.text, stylesConfig.text, textStyle]}>
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 56, // Chiều cao chuẩn UX hiện đại (dễ bấm hơn 50)
        borderRadius: RADIUS.l, // Bo tròn nhiều (Pill shape hoặc Squircle)
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: SPACING.s,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '700',
        fontSize: 16,
        letterSpacing: 0.5, // Giãn chữ nhẹ tạo cảm giác thoáng
        textAlign: 'center',
    },
    iconWrapper: {
        marginRight: 8, // Khoảng cách giữa icon và chữ
    },
    disabled: {
        opacity: 0.5,
        // Loại bỏ shadow khi disable để nút trông "phẳng" xuống
        shadowOpacity: 0,
        elevation: 0,
    }
});