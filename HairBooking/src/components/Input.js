import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../theme';

export const Input = ({
    label,
    icon,
    error,
    password,
    onFocus = () => { },
    onBlur = () => { },
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = (e) => {
        setIsFocused(true);
        onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        onBlur(e);
    };

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.inputWrapper,
                isFocused ? styles.inputWrapperFocused : styles.inputWrapperBlur,
                error && styles.inputWrapperError
            ]}>
                {icon && (
                    <Icon
                        name={icon}
                        size={22}
                        color={isFocused ? COLORS.primary : COLORS.textLight}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholderTextColor={COLORS.textLight}
                    cursorColor={COLORS.primary}
                    secureTextEntry={password && !isPasswordVisible}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {password && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                    >
                        <Icon
                            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                            size={22}
                            color={COLORS.textLight}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={14} color={COLORS.error} style={{ marginRight: 4 }} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.m + 4,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
        color: COLORS.title || '#0F172A',
        fontSize: 14,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: RADIUS.m,
        paddingHorizontal: 16,
        borderWidth: 1.5,
    },
    inputWrapperBlur: {
        backgroundColor: '#F3F4F6',
        borderColor: 'transparent',
    },
    inputWrapperFocused: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    inputWrapperError: {
        backgroundColor: '#FEF2F2',
        borderColor: COLORS.error,
    },

    leftIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
    eyeIcon: {
        padding: 8,
    },

    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginLeft: 4,
    },
    errorText: {
        color: COLORS.error,
        fontSize: 13,
        fontWeight: '500',
    }
});
