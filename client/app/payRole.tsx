import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Payslip from '../components/payslip';
import TaxCalculator from '../components/taxcalculator';

const Payroll = () => {
    const [visibleSection, setVisibleSection] = useState('payslip');

    const handleSectionToggle = (section: string) => {
        setVisibleSection(visibleSection === section ? '' : section);
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    onPress={() => handleSectionToggle('payslip')} 
                    style={[styles.button, visibleSection === 'payslip' && styles.activeButton]}
                >
                    <Text style={[styles.buttonText, visibleSection === 'payslip' && styles.activeButtonText]}>
                        Payslip
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => handleSectionToggle('taxcalculator')} 
                    style={[styles.button, visibleSection === 'taxcalculator' && styles.activeButton]}
                >
                    <Text style={[styles.buttonText, visibleSection === 'taxcalculator' && styles.activeButtonText]}>
                        Tax Calculator
                    </Text>
                </TouchableOpacity>
            </View>

            {visibleSection === 'payslip' && <Payslip />}
            {visibleSection === 'taxcalculator' && <TaxCalculator />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        gap: 20,
        marginLeft: 20,
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

export default Payroll;
