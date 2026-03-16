import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SPACING } from '../theme';

export const LoginScreen = ({ navigation }) => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
        } catch (e) {
            Alert.alert('Login Failed', e.message || 'Check your email/password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <TouchableOpacity
                    style={styles.skipBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.skipText}>Skip & Explore</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Welcome Back 👋</Text>
                <Text style={styles.subtitle}>Book your best look today.</Text>

                <View style={styles.form}>
                    <Input
                        label="Email" 
                        icon="mail-outline"
                        value={email} 
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="Enter your email"
                    />
                    <Input
                        label="Password" 
                        icon="lock-closed-outline"
                        value={password} 
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="Enter your password"
                    />
                    <Button 
                        title={loading ? "Signing in..." : "Sign In"} 
                        onPress={handleLogin} 
                        loading={loading}
                        style={styles.button}
                    />
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? <Text style={styles.link}>Sign Up</Text></Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1, padding: SPACING.l, justifyContent: 'center' },
    skipBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
    skipText: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.secondary },
    subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 8, marginBottom: SPACING.xl },
    form: { marginBottom: SPACING.xl },
    button: { marginTop: SPACING.m },
    footer: { alignItems: 'center' },
    footerText: { color: COLORS.textLight },
    link: { color: COLORS.primary, fontWeight: '700' }
});
