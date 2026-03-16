import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

export const Layout = ({ children, style }) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    const containerWidth = isWeb 
        ? Math.min(width - 40, isDesktop ? 1200 : isTablet ? 800 : width - 40)
        : width;
    
    return (
        <View style={[
            styles.container,
            isWeb && { width: containerWidth, alignSelf: 'center' },
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
