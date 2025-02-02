import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WorkInformation = () => {
  const [workDetails, setWorkDetails] = useState({});
  const [empId, setEmpId] = useState(null);

  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      setEmpId(storedEmpId);
    };

    fetchEmpId();
  }, []);

  useEffect(() => {
    if (empId) {
      const fetchData = async () => {
        try {
          const workResponse = await axios.get(
            `https://global-hrm-mobile-server.vercel.app/employees/getWorkDetails/${empId}`
          );
          setWorkDetails(workResponse.data);
        } catch (err) {
          console.log("Error fetching data:", err);
          Alert.alert("Error", "Failed to fetch work details");
        }
      };

      fetchData();
    }
  }, [empId]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Department:</Text>
          <TextInput
            value={workDetails.department}
            editable={false}
            style={styles.input}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <TextInput
            value={workDetails.location}
            editable={false}
            style={styles.input}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Designation:</Text>
          <TextInput
            value={workDetails.designation}
            editable={false}
            style={styles.input}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Supervisor:</Text>
          <TextInput
            value={workDetails.supervisor}
            editable={false}
            style={styles.input}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaeaea",
    padding: 10,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  row: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default WorkInformation;
