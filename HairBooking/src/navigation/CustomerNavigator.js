import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { ShopDetailScreen } from '../screens/ShopDetailScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { EditProfileScreen } from '../screens/customer/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/customer/ChangePasswordScreen';
import { RegisterShopScreen } from '../screens/RegisterShopScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { MyReviewsScreen } from '../screens/MyReviewsScreen';
import { MyShopRequestsScreen } from '../screens/MyShopRequestsScreen';

// Shop Owner Screens
import { ShopOwnerDashboardScreen } from '../screens/shopowner/ShopOwnerDashboardScreen';
import { ManageShopScreen } from '../screens/shopowner/ManageShopScreen';
import { ManageBarbersScreen } from '../screens/shopowner/ManageBarbersScreen';
import { AddBarberScreen } from '../screens/shopowner/AddBarberScreen';
import { ManageServicesScreen } from '../screens/shopowner/ManageServicesScreen';
import { AddServiceScreen } from '../screens/shopowner/AddServiceScreen';
import { ManageShopBookingsScreen } from '../screens/shopowner/ManageShopBookingsScreen';
import { ManageScheduleScreen } from '../screens/shopowner/ManageScheduleScreen';

import { COLORS } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const getTabBarIcon = (routeName, focused) => {
    switch (routeName) {
        case 'Home':
            return focused ? 'home' : 'home-outline';
        case 'Search':
            return focused ? 'search' : 'search-outline';
        case 'History':
            return focused ? 'calendar' : 'calendar-outline';
        case 'Profile':
            return focused ? 'person' : 'person-outline';
        default:
            return 'help-circle-outline';
    }
};

const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
        const iconName = getTabBarIcon(route.name, focused);
        // Tăng size lên 24-26 cho dễ nhìn
        return (
            <Ionicons
                name={iconName}
                size={focused ? 26 : 22}
                color={color}
            />
        );
    },
    tabBarActiveTintColor: COLORS.primary, // Màu cam/xanh chủ đạo của bạn
    tabBarInactiveTintColor: '#95a5a6',    // Màu xám nhẹ cho icon không active
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
        // Hiệu ứng đổ bóng cho iOS & Android
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
});

const CustomerTabs = () => {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    return (
        <Tab.Navigator
            screenOptions={(props) => ({
                ...screenOptions(props),
                tabBarShowLabel: !isMobile,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
            <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'Tìm kiếm' }} />
            <Tab.Screen name="History" component={MyBookingsScreen} options={{ tabBarLabel: 'Lịch hẹn' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Cá nhân' }} />
        </Tab.Navigator>
    );
};

export const CustomerNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
            <Stack.Screen
                name="ShopDetail"
                component={ShopDetailScreen}
                options={{
                    path: 'shop/:id',
                    headerShown: false,
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="Booking"
                component={BookingScreen}
                options={{
                    headerShown: true,
                    title: 'Đặt lịch',
                    path: 'booking',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="MyBookings"
                component={MyBookingsScreen}
                options={{
                    headerShown: false,
                    path: 'my-bookings',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    headerShown: true,
                    title: 'Chỉnh sửa profile',
                    path: 'edit-profile',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{
                    headerShown: true,
                    title: 'Đổi mật khẩu',
                    path: 'change-password',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="RegisterShop"
                component={RegisterShopScreen}
                options={{
                    headerShown: true,
                    title: 'Đăng ký mở tiệm',
                    path: 'register-shop',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                    headerShown: true,
                    title: 'Thông báo',
                    path: 'notifications',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="Review"
                component={ReviewScreen}
                options={{
                    headerShown: false,
                    path: 'review',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="MyReviews"
                component={MyReviewsScreen}
                options={{
                    headerShown: false,
                    path: 'my-reviews',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="MyShopRequests"
                component={MyShopRequestsScreen}
                options={{
                    headerShown: false,
                    path: 'my-shop-requests',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            
            {/* Shop Owner Screens */}
            <Stack.Screen
                name="ShopOwnerDashboard"
                component={ShopOwnerDashboardScreen}
                options={{
                    headerShown: true,
                    title: 'My Shop',
                    path: 'my-shop',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="ManageShop"
                component={ManageShopScreen}
                options={{
                    headerShown: true,
                    title: 'Thông tin cửa hàng',
                    path: 'manage-shop',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="ManageBarbers"
                component={ManageBarbersScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý thợ cắt tóc',
                    path: 'manage-barbers',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="AddBarber"
                component={AddBarberScreen}
                options={{
                    headerShown: true,
                    title: 'Thêm thợ cắt tóc',
                    path: 'add-barber',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="ManageServices"
                component={ManageServicesScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý dịch vụ',
                    path: 'manage-services',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="AddService"
                component={AddServiceScreen}
                options={{
                    headerShown: true,
                    title: 'Thêm dịch vụ',
                    path: 'add-service',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="ManageShopBookings"
                component={ManageShopBookingsScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý lịch hẹn',
                    path: 'manage-shop-bookings',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
            <Stack.Screen
                name="ManageSchedule"
                component={ManageScheduleScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý lịch làm việc',
                    path: 'manage-schedule',
                    tabBarStyle: { display: 'none' },
                    tabBarVisible: false,
                }}
            />
        </Stack.Navigator>
    );
};
