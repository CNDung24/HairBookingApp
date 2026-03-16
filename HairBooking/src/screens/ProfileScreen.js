import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/Button';
import { COLORS, SPACING, RADIUS } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export const ProfileScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    };

    const MenuItem = ({ icon, title, onPress }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuLeft}>
                <Ionicons name={icon} size={22} color={COLORS.primary} />
                <Text style={styles.menuText}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
        </TouchableOpacity>
    );

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.info}>
                    <Ionicons name="person-circle-outline" size={100} color={COLORS.textLight} />
                    <Text style={[styles.name, { marginTop: 10 }]}>Guest User</Text>
                    <Text style={styles.email}>Sign in to manage your bookings</Text>
                </View>
                <Button title="Login / Register" onPress={() => navigation.navigate('Login')} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    {user.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
                    )}
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                {user.phone && <Text style={styles.phone}>{user.phone}</Text>}
            </View>

            <View style={styles.menuContainer}>
                {/* Chỉ hiển thị Edit Profile cho customer */}
                {user?.role === 'customer' && (
                    <MenuItem 
                        icon="person-outline" 
                        title="Edit Profile" 
                        onPress={() => navigation.navigate('EditProfile')} 
                    />
                )}
                
                <MenuItem 
                    icon="lock-closed-outline" 
                    title="Change Password" 
                    onPress={() => navigation.navigate('ChangePassword')} 
                />

                <MenuItem 
                    icon="notifications-outline" 
                    title="Thông báo" 
                    onPress={() => navigation.navigate('Notifications')} 
                />

                {/* Chỉ hiển thị My Bookings, My Reviews cho customer */}
                {user?.role === 'customer' && (
                    <>
                        <MenuItem 
                            icon="calendar-outline" 
                            title="My Bookings" 
                            onPress={() => navigation.navigate('MyBookings')} 
                        />
                        <MenuItem 
                            icon="star-outline" 
                            title="My Reviews" 
                            onPress={() => {}} 
                        />
                        <MenuItem 
                            icon="business-outline" 
                            title="Đăng ký mở tiệm" 
                            onPress={() => navigation.navigate('RegisterShop')} 
                        />
                    </>
                )}

                {/* Shop Owner: Không cần My Shop vì đã ở trong ShopOwnerNavigator */}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.l },
    header: { alignItems: 'center', marginBottom: SPACING.xl, paddingTop: SPACING.l },
    info: { alignItems: 'center', marginBottom: SPACING.xl },
    avatar: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.m,
        overflow: 'hidden', // Add this to clip the image
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    avatarText: { fontSize: 40, fontWeight: '800', color: COLORS.surface },
    name: { fontSize: 24, fontWeight: '700', color: COLORS.secondary },
    email: { fontSize: 16, color: COLORS.textLight, textAlign: 'center' },
    phone: { fontSize: 14, color: COLORS.primary, marginTop: 4 },
    
    menuContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.l,
        padding: SPACING.m,
        marginBottom: SPACING.xl
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    menuText: { fontSize: 16, marginLeft: SPACING.m, color: COLORS.secondary },
    
    buttonContainer: { marginTop: 'auto', marginBottom: SPACING.l },
    logoutButton: {
        paddingVertical: 15,
        borderRadius: RADIUS.m,
        borderWidth: 1.5,
        borderColor: COLORS.error,
        alignItems: 'center'
    },
    logoutText: {
        color: COLORS.error,
        fontSize: 16,
        fontWeight: '700'
    }
});
