import { useWindowDimensions, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { BarberHomeScreen } from '../screens/barber/BarberHomeScreen';
import { BarberDashboard } from '../screens/barber/BarberDashboard';
import { BarberScheduleScreen } from '../screens/barber/BarberScheduleScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationScreen } from '../screens/NotificationScreen';

import { COLORS } from '../theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Schedule') iconName = focused ? 'list' : 'list-outline';
        else if (route.name === 'Stats') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
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

const BarberTabs = () => {
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
                name="Schedule" 
                component={BarberHomeScreen} 
                options={{ tabBarLabel: 'Lịch làm việc', path: 'barber/schedule' }} 
            />
            <Tab.Screen 
                name="Stats" 
                component={BarberDashboard} 
                options={{ tabBarLabel: 'Thu nhập', path: 'barber/stats' }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{ tabBarLabel: 'Cá nhân', path: 'barber/profile' }}
            />
        </Tab.Navigator>
    );
};

export const BarberNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="BarberTabs" component={BarberTabs} />
            <Stack.Screen 
                name="BarberSchedule" 
                component={BarberScheduleScreen}
                options={{ path: 'barber/schedule-manage' }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationScreen}
                options={{
                    headerShown: true,
                    title: 'Thông báo',
                    path: 'barber/notifications',
                }}
            />
        </Stack.Navigator>
    );
};
