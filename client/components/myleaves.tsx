import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MyLeaves = () => {
  const [empId, setEmpId] = useState<string | null>(null);
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      if (storedEmpId) {
        setEmpId(storedEmpId);
        fetchLeaves(storedEmpId);
      }
    };
    fetchEmpId();
  }, []);

  const fetchLeaves = async (empId: string) => {
    try {
      const response = await axios.get(`https://global-hrm-mobile-server.vercel.app/employees/getLeaveRequest/${empId}`);
      const sortedLeaves = response.data.sort(
        (a: any, b: any) => new Date(b.date_from).getTime() - new Date(a.date_from).getTime()
      );
      setLeaves(sortedLeaves);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch leave requests.");
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await axios.delete(`https://global-hrm-mobile-server.vercel.app/employees/deleteLeave/${empId}/${leaveId}`);
      Alert.alert("Success", "Leave request cancelled.");
      fetchLeaves(empId!);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel leave request.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Leave Requests</Text>

      {leaves.length === 0 ? (
        <Text style={styles.text}>No leave requests found.</Text>
      ) : (
        leaves.map((leave: any) => (
          <View key={leave.id || Math.random().toString()} style={styles.leaveCard}>
            <Text style={styles.text}>Type: {leave.leave_type}</Text>
            <Text style={styles.text}>Date From: {new Date(leave.date_from).toLocaleDateString('en-GB')}</Text>
            <Text style={styles.text}>Date To: {new Date(leave.date_to).toLocaleDateString('en-GB')}</Text>
            <Text style={styles.text}>Time From: {leave.time_from}</Text>
            <Text style={styles.text}>Time To: {leave.time_to}</Text>
            <Text style={styles.text}>Status: {leave.status}</Text>

            {leave.status === "Pending" && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleCancelLeave(leave.id)}
              >
                <Text style={styles.buttonText}>Cancel Leave</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  text: { fontSize: 16, marginVertical: 5 },
  leaveCard: { padding: 15, marginVertical: 5, borderWidth: 1, borderRadius: 5, borderColor: "#ccc" },
  button: { borderRadius: 10, backgroundColor: "red", padding: 10, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});

export default MyLeaves;