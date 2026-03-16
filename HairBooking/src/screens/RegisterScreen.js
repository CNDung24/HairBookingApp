import React, { useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SPACING } from '../theme';

const RegisterSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Min 6 chars').required('Required'),
});

export const RegisterScreen = ({ navigation }) => {
    const { register } = useContext(AuthContext);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and get fresh.</Text>

            <Formik
                initialValues={{ name: '', email: '', password: '' }}
                validationSchema={RegisterSchema}
                onSubmit={async (values) => {
                    try {
                        await register(values.name, values.email, values.password);
                        Alert.alert('Success', 'Account created! Please login.', [
                            { text: 'OK', onPress: () => navigation.navigate('Login') }
                        ]);
                    } catch (e) {
                        Alert.alert('Error', 'Registration failed.');
                    }
                }}
            >
                {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
                    <View style={styles.form}>
                        <Input
                            label="Full Name" icon="person-outline"
                            value={values.name} onChangeText={handleChange('name')}
                            error={touched.name && errors.name}
                        />
                        <Input
                            label="Email" icon="mail-outline"
                            value={values.email} onChangeText={handleChange('email')}
                            error={touched.email && errors.email}
                            autoCapitalize="none"
                        />
                        <Input
                            label="Password" icon="lock-closed-outline"
                            value={values.password} onChangeText={handleChange('password')}
                            error={touched.password && errors.password}
                            secureTextEntry
                        />
                        <Button title="Sign Up" onPress={handleSubmit} loading={isSubmitting} />
                    </View>
                )}
            </Formik>
            <Button title="Back to Login" onPress={() => navigation.goBack()} variant="outline" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.l, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: COLORS.secondary },
    subtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 8, marginBottom: SPACING.xl },
    form: { marginBottom: SPACING.m },
});
