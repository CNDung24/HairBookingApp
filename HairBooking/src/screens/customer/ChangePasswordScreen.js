import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, SPACING } from '../../theme';

export const ChangePasswordScreen = ({ navigation }) => {
    const { changePassword } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password changed successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
                <Input 
                    label="Current Password" 
                    value={currentPassword} 
                    onChangeText={setCurrentPassword} 
                    secureTextEntry
                    placeholder="Enter current password"
                />
                <Input 
                    label="New Password" 
                    value={newPassword} 
                    onChangeText={setNewPassword} 
                    secureTextEntry
                    placeholder="Enter new password"
                />
                <Input 
                    label="Confirm New Password" 
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword} 
                    secureTextEntry
                    placeholder="Confirm new password"
                />
                <Button 
                    title="Change Password" 
                    onPress={handleChangePassword} 
                    loading={loading}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: SPACING.l, backgroundColor: COLORS.background },
    form: { marginTop: SPACING.l }
});
