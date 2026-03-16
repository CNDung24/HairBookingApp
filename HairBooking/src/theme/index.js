import { Platform } from 'react-native';

export const COLORS = {
    // Màu chủ đạo (Nâu vàng - Elegant vibe)
    primary: '#B68B63',
    primaryLight: '#D7AE86',
    primaryDark: '#8A623C',
    primarySoft: '#F6EDE4',

    // Màu nền & Surface
    background: '#FFF9EB', // Nền màu kem pha chút cam nhẹ
    surface: '#FFFFFF',
    headerBackground: '#35434A',

    // Màu chữ
    secondary: '#111827',
    title: '#0F172A',
    text: '#334155',
    textLight: '#94A3B8',

    // Màu viền
    border: '#E2E8F0',

    // Status Colors
    success: '#10B981',
    successBg: '#D1FAE5',
    successLight: '#ECFDF5',
    pending: '#F59E0B',
    pendingBg: '#FEF3C7',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    errorLight: '#FEF2F2',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',

    overlay: 'rgba(0,0,0,0.4)',
};

export const SPACING = { s: 8, m: 16, l: 24 };
export const RADIUS = { s: 8, m: 16, l: 24, xl: 30 };

// Shadow hiện đại (Soft Shadow)
export const SHADOWS = {
    small: Platform.select({
        ios: {
            shadowColor: '#64748B', // Bóng màu xám xanh thay vì đen
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.1,     // Độ mờ thấp
            shadowRadius: 20,
        },
        android: {
            elevation: 8,
        },
        web: {
            boxShadow: '0px 10px 25px rgba(100, 116, 139, 0.1)',
        }
    }),
    medium: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 6,
        },
        android: { elevation: 4 },
        web: { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)' }
    }),
    card: Platform.select({
        ios: {
            shadowColor: '#111827',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.06,
            shadowRadius: 12,
        },
        android: { elevation: 5 },
        web: { boxShadow: '0px 6px 12px rgba(17, 24, 39, 0.06)' }
    })
};