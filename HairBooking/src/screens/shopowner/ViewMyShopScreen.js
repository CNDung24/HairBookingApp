import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { ShopDetailScreen } from '../ShopDetailScreen';
import client from '../../api/client';
import { COLORS } from '../../theme';

export const ViewMyShopScreen = ({ navigation }) => {
    const [shopId, setShopId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyShop = async () => {
            try {
                const res = await client.get('/shop-owner/shop');
                if (res.data && res.data.id) {
                    setShopId(res.data.id);
                }
            } catch (error) {
                console.error('Error fetching shop:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyShop();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={{ marginTop: 10, color: COLORS.textLight }}>Đang tải shop...</Text>
            </View>
        );
    }

    if (!shopId) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
                <Text style={{ color: COLORS.textLight }}>Không tìm thấy shop của bạn</Text>
            </View>
        );
    }

    return <ShopDetailScreen route={{ params: { shopId } }} navigation={navigation} />;
};
