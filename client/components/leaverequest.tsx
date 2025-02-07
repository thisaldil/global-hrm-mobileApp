import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from "@react-native-async-storage/async-storage";

const LeaveRequest = () => {
    const [empId, setEmpId] = useState<string | null>(null);
    const today = new Date();
    const [leaveData, setLeaveData] = useState({
        leave_type: '',
        date_from: '',
        date_to: '',
        time_from: '',
        time_to: '',
        description: '',
        status: 'Pending',
    });
    const [errors, setErrors] = useState<{ date_from?: string; date_to?: string; time_to?: string }>({});
    const [showDatePicker, setShowDatePicker] = useState({ date_from: false, date_to: false });
    const [showTimePicker, setShowTimePicker] = useState({ time_from: false, time_to: false });

    useEffect(() => {
        AsyncStorage.getItem("empId").then(setEmpId);
    }, []);

    const validateField = (name: string, value: string) => {
        let newErrors = { ...errors };
        if (name === 'date_from' && new Date(value) < today) newErrors.date_from = "Date From cannot be in the past.";
        else delete newErrors.date_from;
        if (name === 'date_to' && new Date(value) < new Date(leaveData.date_from)) newErrors.date_to = "Date To must be later than Date From.";
        else delete newErrors.date_to;
        if (name === 'time_to' && leaveData.date_from === leaveData.date_to && value < leaveData.time_from) newErrors.time_to = "Time To cannot be earlier than Time From.";
        else delete newErrors.time_to;
        setErrors(newErrors);
    };

    const handleChange = (name: string, value: string) => {
        setLeaveData(prevState => ({ ...prevState, [name]: value }));
        validateField(name, value);
    };

    const formatTime = (time: Date) => {
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const handleSubmit = async () => {
        if (Object.keys(errors).length > 0 || !leaveData.date_from || !leaveData.date_to) {
            Alert.alert('Validation Error', 'Please fix the errors before submitting.');
            return;
        }
        const newLeaveRequest = { ...leaveData, empId };
        try {
            await axios.post(`https://global-hrm-mobile-server.vercel.app/employees/requestLeave/${empId}`, newLeaveRequest);
            setLeaveData({ leave_type: '', date_from: '', date_to: '', time_from: '', time_to: '', description: '', status: 'Pending' });
            Alert.alert('Success', 'Leave request submitted successfully!');
        } catch {
            Alert.alert('Error', 'Failed to submit leave request.');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Submit Leave Request</Text>

                <Text style={styles.label}>Leave Type</Text>
                <Picker selectedValue={leaveData.leave_type} onValueChange={value => handleChange('leave_type', value)} style={styles.picker}>
                    <Picker.Item label="Select Leave Type" value="" />
                    <Picker.Item label="Sick Leave" value="Sick Leave" />
                    <Picker.Item label="Vacation/Annual Leave" value="Vacation/Annual Leave" />
                    <Picker.Item label="Personal Leave" value="Personal Leave" />
                    <Picker.Item label="Parental Leave" value="Parental Leave" />
                    <Picker.Item label="Bereavement Leave" value="Bereavement Leave" />
                    <Picker.Item label="Unpaid Leave" value="Unpaid Leave" />
                    <Picker.Item label="Study/Education Leave" value="Study/Education Leave" />
                    <Picker.Item label="Family and Medical Leave" value="Family and Medical Leave" />
                </Picker>

                <Text style={styles.label}>Date From</Text>
                <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, date_from: true })}>
                    <View style={styles.input}><Text>{leaveData.date_from || "Select Date From"}</Text></View>
                </TouchableOpacity>
                {showDatePicker.date_from && (
                    <DateTimePicker value={today} mode="date" display="default" onChange={(event, date) => {
                        setShowDatePicker({ ...showDatePicker, date_from: false });
                        if (date) handleChange('date_from', date.toISOString().split('T')[0]);
                    }} />
                )}

                <Text style={styles.label}>Date To</Text>
                <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, date_to: true })}>
                    <View style={styles.input}><Text>{leaveData.date_to || "Select Date To"}</Text></View>
                </TouchableOpacity>
                {showDatePicker.date_to && (
                    <DateTimePicker value={today} mode="date" display="default" onChange={(event, date) => {
                        setShowDatePicker({ ...showDatePicker, date_to: false });
                        if (date) handleChange('date_to', date.toISOString().split('T')[0]);
                    }} />
                )}

                <Text style={styles.label}>Time From</Text>
                <TouchableOpacity onPress={() => setShowTimePicker({ ...showTimePicker, time_from: true })}>
                    <View style={styles.input}><Text>{leaveData.time_from || "Select Time From"}</Text></View>
                </TouchableOpacity>
                {showTimePicker.time_from && (
                    <DateTimePicker value={today} mode="time" display="default" onChange={(event, time) => {
                        setShowTimePicker({ ...showTimePicker, time_from: false });
                        if (time) handleChange('time_from', formatTime(time));
                    }} />
                )}

                <Text style={styles.label}>Time To</Text>
                <TouchableOpacity onPress={() => setShowTimePicker({ ...showTimePicker, time_to: true })}>
                    <View style={styles.input}><Text>{leaveData.time_to || "Select Time To"}</Text></View>
                </TouchableOpacity>
                {showTimePicker.time_to && (
                    <DateTimePicker value={today} mode="time" display="default" onChange={(event, time) => {
                        setShowTimePicker({ ...showTimePicker, time_to: false });
                        if (time) handleChange('time_to', formatTime(time));
                    }} />
                )}

                <View style={styles.buttonContainer}>
                    <Button title="Submit" color="#FF8C00" onPress={handleSubmit} />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, borderRadius: 15 },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
    label: { fontSize: 18, marginBottom: 10, color: '#555' },
    picker: { height: 50, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, borderRadius: 5, backgroundColor: '#f9f9f9' },
    input: { height: 50, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10, borderRadius: 5, backgroundColor: '#f9f9f9', justifyContent: 'center' },
    buttonContainer: { marginTop: 20, backgroundColor: '#fa7c10', borderRadius: 10, overflow: 'hidden' },
});

export default LeaveRequest;