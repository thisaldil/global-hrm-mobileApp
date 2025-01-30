import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";
import axios from "axios";

const LeaveAnalysis = () => {
  const [empId, setEmpId] = useState<string | null>(null);
  const [leaveData, setLeaveData] = useState({ casual: 0, sick: 0, annual: 0 });

  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      if (storedEmpId) {
        setEmpId(storedEmpId);
        fetchLeaveData(storedEmpId);
      }
    };
    fetchEmpId();
  }, []);

  const fetchLeaveData = async (empId: string) => {
    try {
      const response = await axios.get(`https://global-hrm-mobile-server.vercel.app/employees/leaveAnalysis/${empId}`);
      setLeaveData(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch leave data.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Leave Analysis</Text>

      <BarChart
  data={{
    labels: ["Casual", "Sick", "Annual"],
    datasets: [{ data: [leaveData.casual, leaveData.sick, leaveData.annual] }],
  }}
  width={350}
  height={220}
  yAxisLabel=""  // Optional
  yAxisSuffix=" days"  // Optional
  chartConfig={{
    backgroundColor: "#fff", // Set background to white
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Orange color for the bars
    labelColor: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`, // Gray color for the labels
    style: {
      borderRadius: 0, // Remove border radius
      borderWidth: 0,  // Remove border width
    },
  }}
  style={{ marginVertical: 8 }}
/>

      <Text style={styles.text}>Casual Leaves Used: {leaveData.casual}</Text>
      <Text style={styles.text}>Sick Leaves Used: {leaveData.sick}</Text>
      <Text style={styles.text}>Annual Leaves Used: {leaveData.annual}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  text: { fontSize: 16, textAlign: "center", marginTop: 5 },
});

export default LeaveAnalysis;
