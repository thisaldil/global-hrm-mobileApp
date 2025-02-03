import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Payslip = () => {
  const [empId, setEmpId] = useState<string | null>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("empId").then((value) => {
      setEmpId(value);
    });
  }, []);

  useEffect(() => {
    if (!empId) return;

    const fetchPayslips = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`https://global-hrm-mobile-server.vercel.app/admin/getPayslip/${empId}`);
        setPayslips(response.data);
      } catch (err) {
        console.error('Error fetching payslips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [empId]);

  const getCurrentPayslip = () => {
    const currentDate = new Date();
    return payslips.find((payslip) => {
      const payslipDate = new Date(payslip.date);
      return (
        payslipDate.getFullYear() === currentDate.getFullYear() &&
        payslipDate.getMonth() === currentDate.getMonth()
      );
    });
  };

  const currentPayslip = getCurrentPayslip();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {loading && <ActivityIndicator size="large" color="#02c3cc" />}
        {!loading && !currentPayslip && <Text style={styles.noPayslipsText}>No payslip found for the current month</Text>}

        {currentPayslip && (
          <>
            <Text style={styles.headerText}>Payslip for {formatDate(currentPayslip.date)}</Text>
            <Text style={styles.text}>Total days worked: <Text style={styles.bold}>{currentPayslip.total_days_worked}</Text></Text>
            <Text style={styles.text}>Total hours worked: <Text style={styles.bold}>{currentPayslip.total_hours_worked}</Text></Text>

            <ScrollView style={styles.tableContainer} nestedScrollEnabled={true}>
              {Object.keys(currentPayslip.earnings).map((key, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellLeft}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.tableCellRight}>{parseFloat(currentPayslip.earnings[key]).toFixed(2)}</Text>
                </View>
              ))}
              {Object.keys(currentPayslip.deductions).map((key, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCellLeft}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.tableCellRight}>{parseFloat(currentPayslip.deductions[key]).toFixed(2)}</Text>
                </View>
              ))}
              <View style={styles.tableRow}>
                <Text style={styles.tableCellLeft}>Total Earnings</Text>
                <Text style={styles.tableCellRight}>{currentPayslip.total_earnings}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableCellLeft}>Total Deductions</Text>
                <Text style={styles.tableCellRight}>{currentPayslip.total_deductions}</Text>
              </View>
              <View style={styles.tableRow1}>
                <Text style={styles.tableCellLeft}>Net Pay</Text>
                <Text style={styles.tableCellRight}>{currentPayslip.net_pay}</Text>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tableRow1: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: '#f4f4f4',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tableCellLeft: {
    flex: 1,
    fontSize: 16,
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
  },
  noPayslipsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  tableContainer: {
    maxHeight: 400,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 20,
  },
});

export default Payslip;