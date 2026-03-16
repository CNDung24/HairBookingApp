import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { ShopOwnerDashboardScreen } from '../screens/shopowner/ShopOwnerDashboardScreen';
import { ViewMyShopScreen } from '../screens/shopowner/ViewMyShopScreen';
import { ManageShopScreen } from '../screens/shopowner/ManageShopScreen';
import { ManageBarbersScreen } from '../screens/shopowner/ManageBarbersScreen';
import { AddBarberScreen } from '../screens/shopowner/AddBarberScreen';
import { ManageServicesScreen } from '../screens/shopowner/ManageServicesScreen';
import { AddServiceScreen } from '../screens/shopowner/AddServiceScreen';
import { ManageShopBookingsScreen } from '../screens/shopowner/ManageShopBookingsScreen';
import { ManageReviewsScreen } from '../screens/shopowner/ManageReviewsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChangePasswordScreen } from '../screens/customer/ChangePasswordScreen';
import { NotificationScreen } from '../screens/NotificationScreen';

import { COLORS } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
        else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
    },
    tabBarActiveTintColor: COLORS.primary,
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

const ShopOwnerTabs = () => {
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
                component={ShopOwnerDashboardScreen}
                options={{ tabBarLabel: 'Tổng quan', path: 'shop-owner/dashboard' }}
            />
            <Tab.Screen 
                name="Bookings" 
                component={ManageShopBookingsScreen}
                options={{ tabBarLabel: 'Lịch hẹn', path: 'shop-owner/bookings' }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ tabBarLabel: 'Cá nhân', path: 'shop-owner/profile' }}
            />
        </Tab.Navigator>
    );
};

export const ShopOwnerNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ShopOwnerTabs" component={ShopOwnerTabs} />
            <Stack.Screen
                name="ViewMyShop"
                component={ViewMyShopScreen}
                options={{
                    headerShown: true,
                    title: 'Xem shop của tôi',
                    path: 'shop-owner/view-shop',
                }}
            />
            <Stack.Screen
                name="ManageShop"
                component={ManageShopScreen}
                options={{
                    headerShown: true,
                    title: 'Thông tin cửa hàng',
                    path: 'shop-owner/manage-shop',
                }}
            />
            <Stack.Screen
                name="ManageBarbers"
                component={ManageBarbersScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý thợ cắt tóc',
                    path: 'shop-owner/manage-barbers',
                }}
            />
            <Stack.Screen
                name="AddBarber"
                component={AddBarberScreen}
                options={{
                    headerShown: true,
                    title: 'Thêm thợ cắt tóc',
                    path: 'shop-owner/add-barber',
                }}
            />
            <Stack.Screen
                name="ManageServices"
                component={ManageServicesScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý dịch vụ',
                    path: 'shop-owner/manage-services',
                }}
            />
            <Stack.Screen
                name="AddService"
                component={AddServiceScreen}
                options={{
                    headerShown: true,
                    title: 'Thêm dịch vụ',
                    path: 'shop-owner/add-service',
                }}
            />
            <Stack.Screen
                name="ManageShopBookings"
                component={ManageShopBookingsScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý lịch hẹn',
                    path: 'shop-owner/manage-bookings',
                }}
            />
            <Stack.Screen
                name="ManageReviews"
                component={ManageReviewsScreen}
                options={{
                    headerShown: true,
                    title: 'Quản lý đánh giá',
                    path: 'shop-owner/manage-reviews',
                }}
            />
            <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{
                    headerShown: true,
                    title: 'Đổi mật khẩu',
                    path: 'shop-owner/change-password',
                }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                    headerShown: true,
                    title: 'Thông báo',
                    path: 'shop-owner/notifications',
                }}
            />
        </Stack.Navigator>
    );
};
