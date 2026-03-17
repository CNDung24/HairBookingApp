// src/screens/NotificationScreen.js
import React from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, Alert, Platform
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import client from '../api/client';
import { COLORS, SPACING, RADIUS } from '../theme';

export const NotificationScreen = ({ navigation }) => {
    const queryClient = useQueryClient();
    const { user } = useContext(AuthContext);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const response = await client.get('/notifications');
            return response.data.data;
        }
    });

    const markReadMutation = useMutation({
        mutationFn: async (id) => {
            const response = await client.put(`/notifications/${id}/read`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['unreadCount']);
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            const response = await client.put('/notifications/read-all');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['unreadCount']);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await client.delete(`/notifications/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['unreadCount']);
        }
    });

    const handleMarkAsRead = (id) => {
        markReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        Alert.alert(
            'Đánh dấu đã đọc',
            'Bạn có muốn đánh dấu tất cả thông báo đã đọc?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đồng ý', onPress: () => markAllReadMutation.mutate() }
            ]
        );
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Xóa thông báo',
            'Bạn có chắc chắn muốn xóa thông báo này?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'booking':
                return 'calendar';
            case 'promotion':
                return 'pricetag';
            case 'system':
                return 'settings';
            case 'shop_request':
                return 'storefront';
            default:
                return 'notifications';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Vừa xong';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
        
        return date.toLocaleDateString('vi-VN');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
            onPress={() => {
                if (!item.isRead) {
                    handleMarkAsRead(item.id);
                }
            }}
            onLongPress={() => handleDelete(item.id)}
        >
            <View style={styles.iconContainer}>
                <Icon 
                    name={getNotificationIcon(item.type)} 
                    size={24} 
                    color={COLORS.primary} 
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
                    {item.title}
                </Text>
                <Text style={styles.content} numberOfLines={2}>
                    {item.message || item.content}
                </Text>
                <Text style={styles.date}>
                    {formatDate(item.createdAt)}
                </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="notifications-off-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Thông báo</Text>
                {data?.some(n => !n.isRead) && (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                        <Text style={styles.markAllRead}>Đánh dấu đã đọc</Text>
                    </TouchableOpacity>
                )}
            </View>
            <FlatList
                style={{ flex: 1 }}
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={isLoading} 
                        onRefresh={refetch}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={renderEmpty}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        ...(Platform.OS === 'web' && {
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.title,
    },
    markAllRead: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: SPACING.m,
        flexGrow: 1,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.m,
        padding: SPACING.m,
        marginBottom: SPACING.s,
        alignItems: 'flex-start',
    },
    unreadItem: {
        backgroundColor: COLORS.primarySoft + '20',
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.primarySoft || '#FFE4D6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.m,
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.title,
        marginBottom: 4,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    content: {
        fontSize: 13,
        color: COLORS.textLight,
        lineHeight: 18,
    },
    date: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: SPACING.s,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginLeft: SPACING.s,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        marginTop: SPACING.m,
        fontSize: 16,
        color: COLORS.textLight,
    },
});
