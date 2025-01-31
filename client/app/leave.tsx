import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LeaveRequest from '../components/leaverequest';
import LeaveAnalysis from '../components/leaveanalysis';
import MyLeaves from '../components/myleaves';

const LeaveAndAttendance = () => {
    const [visibleSection, setVisibleSection] = useState('leave');

    const handleSectionToggle = (section: string) => {
        setVisibleSection(visibleSection === section ? '' : section);
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    onPress={() => handleSectionToggle('leave')} 
                    style={[styles.button, visibleSection === 'leave' && styles.activeButton]}
                >
                    <Text style={[styles.buttonText, visibleSection === 'leave' && styles.activeButtonText]}>
                        Leave Request
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleSectionToggle('myleaves')} 
                    style={[styles.button, visibleSection === 'myleaves' && styles.activeButton]}
                >
                    <Text style={[styles.buttonText, visibleSection === 'myleaves' && styles.activeButtonText]}>
                        My Leaves
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleSectionToggle('attendance')} 
                    style={[styles.button, visibleSection === 'attendance' && styles.activeButton]}
                >
                    <Text style={[styles.buttonText, visibleSection === 'attendance' && styles.activeButtonText]}>
                        Leave Analysis
                    </Text>
                </TouchableOpacity>
            </View>

            {visibleSection === 'leave' && <LeaveRequest />}
            {visibleSection === 'myleaves' && <MyLeaves />}
            {visibleSection === 'attendance' && <LeaveAnalysis />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginVertical: 30,
        gap: 5,
        marginLeft: 8,
    },
    button: {
        paddingVertical: 7,
        paddingHorizontal: 15,
        borderWidth: 2,
        borderColor: '#fa7c10',
        borderRadius: 25,
        backgroundColor: 'transparent',
    },
    activeButton: {
        backgroundColor: '#fa7c10',
    },
    buttonText: {
        color: '#fa7c10',
        fontWeight: 'bold',
    },
    activeButtonText: {
        color: '#fff',
    },
});

export default LeaveAndAttendance;
