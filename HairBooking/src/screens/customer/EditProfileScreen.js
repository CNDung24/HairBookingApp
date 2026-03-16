import React, { useState, useContext } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, SPACING } from '../../theme';

export const EditProfileScreen = ({ navigation }) => {
    const { user, updateProfile } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }
        
        setLoading(true);
        try {
            await updateProfile({ name, phone });
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
                <Input 
                    label="Full Name" 
                    value={name} 
                    onChangeText={setName} 
                    placeholder="Enter your name"
                />
                <Input 
                    label="Phone Number" 
                    value={phone} 
                    onChangeText={setPhone} 
                    keyboardType="phone-pad"
                    placeholder="Enter your phone"
                />
                <Button 
                    title="Save Changes" 
                    onPress={handleUpdate} 
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
