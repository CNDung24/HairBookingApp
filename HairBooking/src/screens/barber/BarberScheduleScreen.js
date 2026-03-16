// src/screens/barber/BarberScheduleScreen.js
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
    TextInput, StatusBar, Alert, ScrollView
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../../api/client';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../theme';

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Thứ 2' },
    { key: 'tuesday', label: 'Thứ 3' },
    { key: 'wednesday', label: 'Thứ 4' },
    { key: 'thursday', label: 'Thứ 5' },
    { key: 'friday', label: 'Thứ 6' },
    { key: 'saturday', label: 'Thứ 7' },
    { key: 'sunday', label: 'Chủ nhật' },
];

const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const BarberScheduleScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(null);
    const [form, setForm] = useState({
        dayOfWeek: '',
        startTime: '09:00',
        endTime: '18:00',
        breakStart: '12:00',
        breakEnd: '13:00',
        isOff: false,
        offReason: ''
    });

    const { data: schedules, isLoading } = useQuery({
        queryKey: ['barber-schedule'],
        queryFn: async () => (await client.get('/schedule/my')).data.data
    });

    const createMutation = useMutation({
        mutationFn: (data) => client.post('/schedule', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['barber-schedule']);
            setModalVisible(false);
            Alert.alert('Thành công', 'Cập nhật lịch thành công');
        },
        onError: (err) => Alert.alert('Lỗi', err.response?.data?.message || 'Cập nhật thất bại')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => client.delete(`/schedule/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['barber-schedule']);
            Alert.alert('Thành công', 'Xóa lịch thành công');
        }
    });

    const setDayOffMutation = useMutation({
        mutationFn: (data) => client.post('/schedule/day-off', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['barber-schedule']);
            Alert.alert('Thành công', 'Đã đăng ký nghỉ');
        }
    });

    const handleCreate = () => {
        if (!form.dayOfWeek) {
            Alert.alert('Lỗi', 'Vui lòng chọn ngày');
            return;
        }
        createMutation.mutate(form);
    };

    const getScheduleForDay = (dayKey) => schedules?.find(s => s.dayOfWeek === dayKey);

    const renderSchedule = ({ item: day }) => {
        const schedule = getScheduleForDay(day.key);
        
        return (
            <View style={styles.dayCard}>
                <View style={styles.dayHeader}>
                    <Text style={styles.dayLabel}>{day.label}</Text>
                    {schedule ? (
                        <TouchableOpacity onPress={() => deleteMutation.mutate(schedule.id)}>
                            <Icon name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    ) : null}
                </View>
                
                {schedule ? (
                    schedule.isOff ? (
                        <View style={styles.offStatus}>
                            <Icon name="close-circle" size={20} color="#EF4444" />
                            <Text style={styles.offText}>Nghỉ {schedule.offReason && `- ${schedule.offReason}`}</Text>
                        </View>
                    ) : (
                        <View style={styles.scheduleInfo}>
                            <View style={styles.timeItem}>
                                <Text style={styles.timeLabel}>Làm việc:</Text>
                                <Text style={styles.timeValue}>{schedule.startTime} - {schedule.endTime}</Text>
                            </View>
                            {schedule.breakStart && (
                                <View style={styles.timeItem}>
                                    <Text style={styles.timeLabel}>Nghỉ trưa:</Text>
                                    <Text style={styles.timeValue}>{schedule.breakStart} - {schedule.breakEnd}</Text>
                                </View>
                            )}
                        </View>
                    )
                ) : (
                    <View style={styles.noSchedule}>
                        <Text style={styles.noScheduleText}>Chưa có lịch</Text>
                    </View>
                )}

                <View style={styles.dayActions}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, schedule?.isOff && styles.actionBtnActive]}
                        onPress={() => {
                            if (schedule?.isOff) {
                                createMutation.mutate({ dayOfWeek: day.key, startTime: '09:00', endTime: '18:00', isOff: false });
                            } else {
                                setForm({ ...form, dayOfWeek: day.key, isOff: true, startTime: '', endTime: '' });
                                setSelectedDay(day);
                                setModalVisible(true);
                            }
                        }}
                    >
                        <Icon name={schedule?.isOff ? 'checkmark' : 'close'} size={16} color={schedule?.isOff ? '#FFF' : '#EF4444'} />
                        <Text style={[styles.actionText, schedule?.isOff && styles.actionTextActive]}>
                            {schedule?.isOff ? 'Làm việc' : 'Nghỉ'}
                        </Text>
                    </TouchableOpacity>
                    
                    {!schedule?.isOff && (
                        <TouchableOpacity 
                            style={styles.actionBtn}
                            onPress={() => {
                                setForm({ 
                                    ...form, 
                                    dayOfWeek: day.key, 
                                    startTime: schedule?.startTime || '09:00',
                                    endTime: schedule?.endTime || '18:00',
                                    breakStart: schedule?.breakStart || '12:00',
                                    breakEnd: schedule?.breakEnd || '13:00',
                                    isOff: false 
                                });
                                setSelectedDay(day);
                                setModalVisible(true);
                            }}
                        >
                            <Icon name="create-outline" size={16} color={COLORS.primary} />
                            <Text style={[styles.actionText, { color: COLORS.primary }]}>Sửa</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color={COLORS.title} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lịch làm việc</Text>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.loading}><Text>Đang tải...</Text></View>
            ) : (
                <FlatList
                    data={DAYS_OF_WEEK}
                    keyExtractor={(item) => item.key}
                    renderItem={renderSchedule}
                    contentContainerStyle={styles.list}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {form.isOff ? 'Đăng ký nghỉ' : 'Cập nhật lịch'} - {selectedDay?.label}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} color={COLORS.title} />
                            </TouchableOpacity>
                        </View>

                        {form.isOff ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Lý do nghỉ (tùy chọn)"
                                    value={form.offReason}
                                    onChangeText={(t) => setForm({ ...form, offReason: t })}
                                />
                                <TouchableOpacity 
                                    style={[styles.submitBtn, { backgroundColor: '#EF4444' }]} 
                                    onPress={() => setDayOffMutation.mutate({ dayOfWeek: form.dayOfWeek, offReason: form.offReason })}
                                >
                                    <Text style={styles.submitText}>Xác nhận nghỉ</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Giờ bắt đầu</Text>
                                <View style={styles.timeSelect}>
                                    {TIME_SLOTS.map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[styles.timeChip, form.startTime === time && styles.timeChipActive]}
                                            onPress={() => setForm({ ...form, startTime: time })}
                                        >
                                            <Text style={[styles.timeChipText, form.startTime === time && styles.timeChipTextActive]}>{time}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>Giờ kết thúc</Text>
                                <View style={styles.timeSelect}>
                                    {TIME_SLOTS.map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[styles.timeChip, form.endTime === time && styles.timeChipActive]}
                                            onPress={() => setForm({ ...form, endTime: time })}
                                        >
                                            <Text style={[styles.timeChipText, form.endTime === time && styles.timeChipTextActive]}>{time}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={styles.label}>Nghỉ trưa (tùy chọn)</Text>
                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Từ"
                                        value={form.breakStart}
                                        onChangeText={(t) => setForm({ ...form, breakStart: t })}
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Đến"
                                        value={form.breakEnd}
                                        onChangeText={(t) => setForm({ ...form, breakEnd: t })}
                                    />
                                </View>

                                <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
                                    <Text style={styles.submitText}>Lưu lịch</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.l },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SPACING.l, paddingTop: 0 },
    dayCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.m, padding: SPACING.m, marginBottom: SPACING.m, ...SHADOW },
    dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    dayLabel: { fontSize: 16, fontWeight: '700', color: COLORS.title },
    scheduleInfo: { gap: 4 },
    timeItem: { flexDirection: 'row', gap: 8 },
    timeLabel: { fontSize: 13, color: COLORS.textLight },
    timeValue: { fontSize: 13, fontWeight: '600', color: COLORS.text },
    offStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    offText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
    noSchedule: { paddingVertical: 8 },
    noScheduleText: { fontSize: 13, color: COLORS.textLight },
    dayActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.s, backgroundColor: COLORS.background },
    actionBtnActive: { backgroundColor: '#10B981' },
    actionText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
    actionTextActive: { color: '#FFF' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.l, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.l },
    modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.title },
    label: { fontSize: 14, fontWeight: '600', color: COLORS.title, marginBottom: 8, marginTop: 8 },
    input: { backgroundColor: COLORS.background, borderRadius: RADIUS.s, padding: 12, marginBottom: 12, fontSize: 14 },
    row: { flexDirection: 'row', gap: 8 },
    timeSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.s, backgroundColor: COLORS.background },
    timeChipActive: { backgroundColor: COLORS.primary },
    timeChipText: { fontSize: 13, color: COLORS.text },
    timeChipTextActive: { color: '#FFF', fontWeight: '600' },
    submitBtn: { backgroundColor: COLORS.primary, padding: 14, borderRadius: RADIUS.s, alignItems: 'center', marginTop: 16 },
    submitText: { color: '#FFF', fontWeight: '700', fontSize: 15 }
});
