import { useWindowDimensions, Platform } from 'react-native';

export const useResponsive = () => {
    const { width, height } = useWindowDimensions();
    
    const isWeb = Platform.OS === 'web';
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    // Breakpoints
    const isMobile = width < 768;
    const isWideScreen = width >= 1280;
    
    // Responsive values
    const getResponsiveValue = (mobile, tablet, desktop) => {
        if (isDesktop) return desktop;
        if (isTablet) return tablet;
        return mobile;
    };
    
    // Container width
    const containerWidth = isWeb 
        ? Math.min(width - 40, isDesktop ? 1200 : isTablet ? 800 : width - 40)
        : width;
    
    // Grid columns
    const gridColumns = isDesktop ? 3 : isTablet ? 2 : 1;
    
    // Spacing multiplier
    const spacingMultiplier = isDesktop ? 1.5 : isTablet ? 1.2 : 1;
    
    // Font sizes
    const fontSize = {
        h1: getResponsiveValue(24, 28, 32),
        h2: getResponsiveValue(20, 24, 28),
        h3: getResponsiveValue(18, 20, 22),
        body: getResponsiveValue(14, 15, 16),
        caption: getResponsiveValue(12, 13, 14),
    };
    
    return {
        width,
        height,
        isWeb,
        isTablet,
        isDesktop,
        isMobile,
        isWideScreen,
        containerWidth,
        gridColumns,
        spacingMultiplier,
        fontSize,
        getResponsiveValue,
    };
};

// Responsive breakpoints constant
export const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
};
