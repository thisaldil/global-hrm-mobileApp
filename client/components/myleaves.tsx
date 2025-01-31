import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Button, Alert, StyleSheet } from "react-native";
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
      setLeaves(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch leave requests.");
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    try {
      await axios.delete(`https://global-hrm-mobile-server.vercel.app/employees/deleteLeave/${empId}/${leaveId}`);
      Alert.alert("Success", "Leave request cancelled.");
      fetchLeaves(empId!); // Refresh leave data
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
          <View key={leave._id} style={styles.leaveCard}>
            <Text style={styles.text}>Type: {leave.leaveType}</Text>
            <Text style={styles.text}>Start: {leave.startDate}</Text>
            <Text style={styles.text}>End: {leave.endDate}</Text>
            <Text style={styles.text}>Status: {leave.status}</Text>

            {leave.status === "Pending" && (
              <Button title="Cancel Leave" color="red" onPress={() => handleCancelLeave(leave._id)} />
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
});

export default MyLeaves;
