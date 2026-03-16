import React, { useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { CustomerNavigator } from './CustomerNavigator';
import { BarberNavigator } from './BarberNavigator';
import { AdminNavigator } from './AdminNavigator';
import { ShopOwnerNavigator } from './ShopOwnerNavigator';

import { COLORS } from '../theme';

const Stack = createStackNavigator();

export const AppNavigator = () => {
    const { isLoading, user } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.textLight }}>Loading HairBooking...</Text>
            </View>
        );
    }

    const renderNavigator = () => {
        if (!user) {
            return <Stack.Screen name="AuthNavigator" component={AuthNavigator} />;
        }

        switch (user.role) {
            case 'admin':
                return <Stack.Screen name="AdminNavigator" component={AdminNavigator} />;
            case 'shop_owner':
                return <Stack.Screen name="ShopOwnerNavigator" component={ShopOwnerNavigator} />;
            case 'barber':
                return <Stack.Screen name="BarberNavigator" component={BarberNavigator} />;
            default:
                return <Stack.Screen name="CustomerNavigator" component={CustomerNavigator} />;
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {renderNavigator()}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
