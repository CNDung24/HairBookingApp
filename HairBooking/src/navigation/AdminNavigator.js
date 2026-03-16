import { useWindowDimensions, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { CreateBarberScreen } from '../screens/admin/CreateBarberScreen';
import { ManageServiceScreen } from '../screens/admin/ManageServiceScreen';
import { ManageShopRequestsScreen } from '../screens/admin/ManageShopRequestsScreen';
import { ManageUsersScreen } from '../screens/admin/ManageUsersScreen';
import { ManageShopsScreen } from '../screens/admin/ManageShopsScreen';
import { ManageBookingsScreen } from '../screens/admin/ManageBookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChangePasswordScreen } from '../screens/customer/ChangePasswordScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { ShopOwnerDashboardScreen } from '../screens/shopowner/ShopOwnerDashboardScreen';

import { COLORS } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
    },
    tabBarActiveTintColor: COLORS.primary, // Unified with user style
    tabBarInactiveTintColor: '#95a5a6',
    tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 5,
    },
    tabBarStyle: {
        height: 65,
        paddingTop: 10,
        backgroundColor: '#ffffff',
        borderTopWidth: 0,
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
});

const AdminTabs = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <Tab.Navigator 
            screenOptions={(props) => ({
                ...screenOptions(props),
                tabBarShowLabel: !isMobile,
            })}
        >
            <Tab.Screen 
                name="Dashboard" 
                component={AdminDashboardScreen}
                options={{ tabBarLabel: 'Quản lý', path: 'admin/dashboard' }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ tabBarLabel: 'Cá nhân', path: 'admin/profile' }}
            />
        </Tab.Navigator>
    );
};

export const AdminNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen
                name="CreateBarber"
                component={CreateBarberScreen}
                options={{ headerShown: true, title: 'Add New Barber', path: 'admin/create-barber' }}
            />
            <Stack.Screen
                name="ManageService"
                component={ManageServiceScreen}
                options={{ headerShown: false, path: 'admin/manage-service' }}
            />
            <Stack.Screen
                name="ManageShopRequests"
                component={ManageShopRequestsScreen}
                options={{ headerShown: false, path: 'admin/shop-requests' }}
            />
            <Stack.Screen
                name="ManageUsers"
                component={ManageUsersScreen}
                options={{ headerShown: true, title: 'Quản lý người dùng', path: 'admin/manage-users' }}
            />
            <Stack.Screen
                name="ManageShops"
                component={ManageShopsScreen}
                options={{ headerShown: true, title: 'Quản lý cửa hàng', path: 'admin/manage-shops' }}
            />
            <Stack.Screen
                name="ManageBookings"
                component={ManageBookingsScreen}
                options={{ headerShown: true, title: 'Quản lý lịch hẹn', path: 'admin/manage-bookings' }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ headerShown: true, title: 'Đổi mật khẩu', path: 'admin/change-password' }}
            />
            <Stack.Screen
                name="ShopOwnerDashboard"
                component={ShopOwnerDashboardScreen}
                options={{ headerShown: true, title: 'Quản lý shop', path: 'admin/shop-owner' }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                    headerShown: true,
                    title: 'Thông báo',
                    path: 'admin/notifications',
                }}
            />
        </Stack.Navigator>
    );
};
