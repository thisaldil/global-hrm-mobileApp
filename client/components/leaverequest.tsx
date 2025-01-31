import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const LeaveRequest = () => {
    const empId = '12345'; // Replace with actual empId retrieval logic
    const today = new Date();

    const [leaveData, setLeaveData] = useState({
        leaveType: '',
        dateFrom: '',
        dateTo: '',
        timeFrom: '',
        timeTo: '',
        description: '',
    });
    const [errors, setErrors] = useState<{ dateFrom?: string; dateTo?: string; timeTo?: string }>({});
    const [showDatePicker, setShowDatePicker] = useState({ dateFrom: false, dateTo: false });
    const [showTimePicker, setShowTimePicker] = useState({ timeFrom: false, timeTo: false });

    // Validation function for form fields
    const validateField = (name: string, value: string | number) => {
        let newErrors = { ...errors };

        if (name === 'dateFrom' && new Date(value as string) < today) {
            newErrors.dateFrom = "Date From cannot be in the past.";
        } else {
            delete newErrors.dateFrom;
        }

        if (name === 'dateTo' && new Date(value as string).getTime() < new Date(leaveData.dateFrom).getTime()) {
            newErrors.dateTo = "Date To must be equal to or later than Date From.";
        } else {
            delete newErrors.dateTo;
        }

        if (name === 'timeTo' && leaveData.dateFrom === leaveData.dateTo && Number(value) < Number(leaveData.timeFrom)) {
            newErrors.timeTo = "Time To cannot be earlier than Time From on the same day.";
        } else {
            delete newErrors.timeTo;
        }

        setErrors(newErrors);
    };

    // Handles field value changes and validates input
    const handleChange = (name: string, value: string | number) => {
        setLeaveData(prevState => ({ ...prevState, [name]: value }));
        validateField(name, value);
    };

    // Handles form submission
    const handleSubmit = async () => {
        if (Object.keys(errors).length > 0 || !leaveData.dateFrom || !leaveData.dateTo) {
            Alert.alert('Validation Error', 'Please fix the errors before submitting.');
            return;
        }

        const newLeaveRequest = { ...leaveData, empId, status: 'Pending' };

        try {
            await axios.post(`https://global-hrm-mobile-server.vercel.app/employees/requestLeave/${empId}`, newLeaveRequest);
            setLeaveData({ leaveType: '', dateFrom: '', dateTo: '', timeFrom: '', timeTo: '', description: '' });
            Alert.alert('Success', 'Leave request submitted successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to submit leave request.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}> {/* Added showsVerticalScrollIndicator to hide the scrollbar */}

                <Text style={styles.title}>Submit Leave Request</Text>

                <Text style={styles.label}>Leave Type</Text>
                <Picker selectedValue={leaveData.leaveType} onValueChange={value => handleChange('leaveType', value)} style={styles.picker}>
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
                <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, dateFrom: true })}>
                    <TextInput style={styles.input} value={leaveData.dateFrom} editable={false} placeholder="Select Date From" />
                </TouchableOpacity>
                {showDatePicker.dateFrom && (
                    <DateTimePicker value={today} mode="date" display="default" onChange={(event, date) => {
                        setShowDatePicker({ ...showDatePicker, dateFrom: false });
                        if (date) handleChange('dateFrom', date.toISOString().split('T')[0]);
                    }} />
                )}

                <Text style={styles.label}>Date To</Text>
                <TouchableOpacity onPress={() => setShowDatePicker({ ...showDatePicker, dateTo: true })}>
                    <TextInput style={styles.input} value={leaveData.dateTo} editable={false} placeholder="Select Date To" />
                </TouchableOpacity>
                {showDatePicker.dateTo && (
                    <DateTimePicker value={today} mode="date" display="default" onChange={(event, date) => {
                        setShowDatePicker({ ...showDatePicker, dateTo: false });
                        if (date) handleChange('dateTo', date.toISOString().split('T')[0]);
                    }} />
                )}

                <Text style={styles.label}>Time From</Text>
                <TouchableOpacity onPress={() => setShowTimePicker({ ...showTimePicker, timeFrom: true })}>
                    <TextInput style={styles.input} value={leaveData.timeFrom} editable={false} placeholder="Select Time From" />
                </TouchableOpacity>
                {showTimePicker.timeFrom && (
                    <DateTimePicker value={today} mode="time" display="default" onChange={(event, time) => {
                        setShowTimePicker({ ...showTimePicker, timeFrom: false });
                        if (time) handleChange('timeFrom', time.toLocaleTimeString());
                    }} />
                )}

                <Text style={styles.label}>Time To</Text>
                <TouchableOpacity onPress={() => setShowTimePicker({ ...showTimePicker, timeTo: true })}>
                    <TextInput style={styles.input} value={leaveData.timeTo} editable={false} placeholder="Select Time To" />
                </TouchableOpacity>
                {showTimePicker.timeTo && (
                    <DateTimePicker value={today} mode="time" display="default" onChange={(event, time) => {
                        setShowTimePicker({ ...showTimePicker, timeTo: false });
                        if (time) handleChange('timeTo', time.toLocaleTimeString());
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
    container: {
        flexGrow: 1, // Ensures content can be scrolled
        padding: 20,
        borderRadius: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
        color: '#555',
    },
    picker: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#f9f9f9',
    },
    buttonContainer: {
        marginTop: 20,
        backgroundColor: '#fa7c10',
        borderRadius: 10,
        overflow: 'hidden',
    },
});

export default LeaveRequest;
