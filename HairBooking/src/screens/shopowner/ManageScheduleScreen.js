// src/screens/shopowner/ManageScheduleScreen.js
import React, { useState, useContext } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, FlatList, Modal, TextInput, Platform
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS } from '../../theme';

const DAYS_OF_WEEK = [
    { id: 'monday', label: 'Thứ 2' },
    { id: 'tuesday', label: 'Thứ 3' },
    { id: 'wednesday', label: 'Thứ 4' },
    { id: 'thursday', label: 'Thứ 5' },
    { id: 'friday', label: 'Thứ 6' },
    { id: 'saturday', label: 'Thứ 7' },
    { id: 'sunday', label: 'Chủ nhật' },
];

const TIME_OPTIONS = [];
for (let hour = 7; hour <= 21; hour++) {
    TIME_OPTIONS.push(`${hour.toString().padStart(2, '0')}:00`);
}

export const ManageScheduleScreen = ({ navigation, route }) => {
    const { shop } = route.params || {};
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();

    const [selectedBarber, setSelectedBarber] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        dayOfWeek: '',
        startTime: '09:00',
        endTime: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        isOff: false
    });

    const { data: barbers } = useQuery({
        queryKey: ['shopBarbers', user?.ShopId],
        queryFn: async () => {
            const res = await client.get(`/shops/${user.ShopId}/barbers`);
            return res.data.data;
        },
        enabled: !!user?.ShopId
    });

    const { data: schedules, isLoading } = useQuery({
        queryKey: ['shopSchedules', user?.ShopId],
        queryFn: async () => {
            const res = await client.get(`/schedule/shop/${user.ShopId}`);
            return res.data.data;
        },
        enabled: !!user?.ShopId && !!selectedBarber,
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            const res = await client.post('/schedule/barber', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['shopSchedules']);
            setShowAddModal(false);
            Alert.alert('Thành công', 'Đã thêm lịch làm việc');
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await client.put(`/schedule/schedule/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['shopSchedules']);
            setEditingSchedule(null);
            Alert.alert('Thành công', 'Đã cập nhật lịch làm việc');
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await client.delete(`/schedule/schedule/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['shopSchedules']);
            Alert.alert('Thành công', 'Đã xóa lịch làm việc');
        },
        onError: (error) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra');
        }
    });

    const handleSave = () => {
        if (!selectedBarber) {
            Alert.alert('Lỗi', 'Vui lòng chọn thợ cắt');
            return;
        }
        if (!formData.dayOfWeek) {
            Alert.alert('Lỗi', 'Vui lòng chọn ngày trong tuần');
            return;
        }

        const data = {
            barberId: selectedBarber.id,
            ...formData
        };

        if (editingSchedule) {
            updateMutation.mutate({ id: editingSchedule.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Xóa lịch',
            'Bạn có chắc chắn muốn xóa lịch làm việc này?',
            [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate(id) }
            ]
        );
    };

    const openEditModal = (schedule) => {
        setFormData({
            dayOfWeek: schedule.dayOfWeek || '',
            startTime: schedule.startTime || '09:00',
            endTime: schedule.endTime || '18:00',
            breakStart: schedule.breakStart || '12:00',
            breakEnd: schedule.breakEnd || '13:00',
            isOff: schedule.isOff || false
        });
        setEditingSchedule(schedule);
        setShowAddModal(true);
    };

    const barberSchedules = schedules?.filter(s => s.BarberId === selectedBarber?.id) || [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý lịch làm việc</Text>
            </View>

            <View style={styles.barberSelect}>
                <Text style={styles.label}>Chọn thợ cắt:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {barbers?.map((barber) => (
                        <TouchableOpacity
                            key={barber.id}
                            style={[
                                styles.barberChip,
                                selectedBarber?.id === barber.id && styles.barberChipSelected
                            ]}
                            onPress={() => setSelectedBarber(barber)}
                        >
                            <Text style={[
                                styles.barberChipText,
                                selectedBarber?.id === barber.id && styles.barberChipTextSelected
                            ]}>
                                {barber.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {selectedBarber && (
                <>
                    <View style={styles.actionBar}>
                        <Text style={styles.actionTitle}>Lịch làm việc</Text>
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => {
                                setEditingSchedule(null);
                                setFormData({
                                    dayOfWeek: '',
                                    startTime: '09:00',
                                    endTime: '18:00',
                                    breakStart: '12:00',
                                    breakEnd: '13:00',
                                    isOff: false
                                });
                                setShowAddModal(true);
                            }}
                        >
                            <Icon name="add" size={20} color="#FFF" />
                            <Text style={styles.addButtonText}>Thêm lịch</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scheduleList}>
                        {barberSchedules.length > 0 ? (
                            barberSchedules.map((schedule, index) => (
                                <View key={schedule.id || index} style={styles.scheduleCard}>
                                    <View style={styles.scheduleInfo}>
                                        <Text style={styles.scheduleDay}>
                                            {DAYS_OF_WEEK.find(d => d.id === schedule.dayOfWeek)?.label || schedule.dayOfWeek || 'Ngày cụ thể'}
                                        </Text>
                                        {schedule.specificDate && (
                                            <Text style={styles.scheduleDate}>
                                                {new Date(schedule.specificDate).toLocaleDateString('vi-VN')}
                                            </Text>
                                        )}
                                        <Text style={[
                                            styles.scheduleTime,
                                            schedule.isOff && styles.scheduleOff
                                        ]}>
                                            {schedule.isOff 
                                                ? 'Nghỉ' 
                                                : `${schedule.startTime} - ${schedule.endTime}`
                                            }
                                        </Text>
                                        {!schedule.isOff && schedule.breakStart && (
                                            <Text style={styles.breakTime}>
                                                Nghỉ: {schedule.breakStart} - {schedule.breakEnd}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.scheduleActions}>
                                        <TouchableOpacity 
                                            style={styles.editButton}
                                            onPress={() => openEditModal(schedule)}
                                        >
                                            <Icon name="pencil" size={18} color={COLORS.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.deleteButton}
                                            onPress={() => handleDelete(schedule.id)}
                                        >
                                            <Icon name="trash" size={18} color="#FF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Icon name="calendar-outline" size={50} color={COLORS.textLight} />
                                <Text style={styles.emptyText}>Chưa có lịch làm việc</Text>
                                <Text style={styles.emptySubtext}>Thêm lịch để quản lý thời gian làm việc</Text>
                            </View>
                        )}
                    </ScrollView>
                </>
            )}

            <Modal visible={showAddModal} animationType="slide" transparent keyboardShouldPersistTaps="handled">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingSchedule ? 'Sửa lịch' : 'Thêm lịch làm việc'}
                        </Text>

                        <Text style={styles.label}>Ngày trong tuần:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
                            {DAYS_OF_WEEK.map((day) => (
                                <TouchableOpacity
                                    key={day.id}
                                    style={[
                                        styles.dayChip,
                                        formData.dayOfWeek === day.id && styles.dayChipSelected
                                    ]}
                                    onPress={() => setFormData({ ...formData, dayOfWeek: day.id })}
                                >
                                    <Text style={[
                                        styles.dayChipText,
                                        formData.dayOfWeek === day.id && styles.dayChipTextSelected
                                    ]}>
                                        {day.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.timeRow}>
                            <View style={styles.timeField}>
                                <Text style={styles.label}>Bắt đầu:</Text>
                                <ScrollView style={styles.timePicker} horizontal>
                                    {TIME_OPTIONS.map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeChip,
                                                formData.startTime === time && styles.timeChipSelected
                                            ]}
                                            onPress={() => setFormData({ ...formData, startTime: time })}
                                        >
                                            <Text style={[
                                                styles.timeChipText,
                                                formData.startTime === time && styles.timeChipTextSelected
                                            ]}>{time}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.timeRow}>
                            <View style={styles.timeField}>
                                <Text style={styles.label}>Kết thúc:</Text>
                                <ScrollView style={styles.timePicker} horizontal>
                                    {TIME_OPTIONS.map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeChip,
                                                formData.endTime === time && styles.timeChipSelected
                                            ]}
                                            onPress={() => setFormData({ ...formData, endTime: time })}
                                        >
                                            <Text style={[
                                                styles.timeChipText,
                                                formData.endTime === time && styles.timeChipTextSelected
                                            ]}>{time}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.offToggle}
                            onPress={() => setFormData({ ...formData, isOff: !formData.isOff })}
                        >
                            <Icon 
                                name={formData.isOff ? 'checkbox' : 'square-outline'} 
                                size={24} 
                                color={formData.isOff ? COLORS.primary : COLORS.textLight} 
                            />
                            <Text style={styles.offToggleText}>Đánh dấu là ngày nghỉ</Text>
                        </TouchableOpacity>

                        <View style={styles.modalButtons}>
                            <Button
                                title="Hủy"
                                variant="outline"
                                onPress={() => setShowAddModal(false)}
                                style={styles.modalButton}
                            />
                            <Button
                                title={editingSchedule ? 'Cập nhật' : 'Thêm'}
                                onPress={handleSave}
                                loading={createMutation.isPending || updateMutation.isPending}
                                style={styles.modalButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
    barberSelect: {
        padding: SPACING.m,
        backgroundColor: COLORS.surface,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.title,
        marginBottom: SPACING.s,
    },
    barberChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.m,
        backgroundColor: COLORS.background,
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    barberChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    barberChipText: {
        fontSize: 14,
        color: COLORS.text,
    },
    barberChipTextSelected: {
        color: '#FFF',
        fontWeight: '600',
    },
    actionBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.m,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.title,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
    },
    addButtonText: {
        color: '#FFF',
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    scheduleList: {
        flex: 1,
        padding: SPACING.m,
    },
    scheduleCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        borderRadius: RADIUS.m,
        marginBottom: SPACING.s,
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleDay: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.title,
    },
    scheduleDate: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    scheduleTime: {
        fontSize: 14,
        color: COLORS.primary,
        marginTop: 4,
    },
    scheduleOff: {
        color: '#FF4444',
    },
    breakTime: {
        fontSize: 12,
        color: COLORS.textLight,
    },
    scheduleActions: {
        flexDirection: 'row',
    },
    editButton: {
        padding: SPACING.s,
    },
    deleteButton: {
        padding: SPACING.s,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.title,
        marginTop: SPACING.m,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: SPACING.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: RADIUS.l,
        borderTopRightRadius: RADIUS.l,
        padding: SPACING.l,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.title,
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    dayPicker: {
        marginBottom: SPACING.m,
    },
    dayChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.background,
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dayChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    dayChipText: {
        fontSize: 14,
        color: COLORS.text,
    },
    dayChipTextSelected: {
        color: '#FFF',
    },
    timeRow: {
        marginBottom: SPACING.m,
    },
    timeField: {
        flex: 1,
    },
    timePicker: {
        marginTop: SPACING.xs,
    },
    timeChip: {
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        borderRadius: RADIUS.s,
        backgroundColor: COLORS.background,
        marginRight: SPACING.s,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    timeChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    timeChipText: {
        fontSize: 14,
        color: COLORS.text,
    },
    timeChipTextSelected: {
        color: '#FFF',
    },
    offToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
    },
    offToggleText: {
        marginLeft: SPACING.s,
        fontSize: 14,
        color: COLORS.text,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        marginHorizontal: SPACING.xs,
    },
});
