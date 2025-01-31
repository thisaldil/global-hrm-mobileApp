import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { DatePickerModal } from "react-native-paper-dates";

const PersonalDetails = () => {
  const [details, setDetails] = useState({
    name: "",
    email: "",
    phone: "",
    emergency_contact: "",
    address: "",
    date_of_birth: "",
    gender: "",
    country: "",
    marital_status: "",
    dependents: "0",
  });
  const [isChanged, setIsChanged] = useState(false);
  const [empId, setEmpId] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      setEmpId(storedEmpId);
    };
    fetchEmpId();
  }, []);

  useEffect(() => {
    if (empId) {
      const fetchDetails = async () => {
        try {
          const response = await axios.get(
            `https://global-hrm-mobile-server.vercel.app/employees/getPersonalDetails/${empId}`
          );
          setDetails(response.data || {});
        } catch (err) {
          console.log("Error fetching personal details:", err);
        }
      };
      fetchDetails();
    }
  }, [empId]);

  const handleChange = (name, value) => {
    setDetails({ ...details, [name]: value });
    setIsChanged(true);
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `https://global-hrm-mobile-server.vercel.app/employees/savePersonalDetails/${empId}`,
        details
      );
      Alert.alert("Success", "Details updated successfully");
      setIsChanged(false);
    } catch (err) {
      console.log("Error saving personal details:", err);
      Alert.alert("Error", "Error updating personal details");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {Object.entries(details).map(([key, value]) =>
          key !== "gender" &&
          key !== "marital_status" &&
          key !== "date_of_birth" ? (
            <View style={styles.inputGroup} key={key}>
              <Text style={styles.label}>
                {key.replace("_", " ").toUpperCase()}
              </Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={(text) => handleChange(key, text)}
                placeholder={`Enter ${key.replace("_", " ")}`}
              />
            </View>
          ) : null
        )}

        <Text style={styles.label}>Gender</Text>
        <Picker
          selectedValue={details.gender}
          onValueChange={(value) => handleChange("gender", value)}
          style={styles.input}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>

        <Text style={styles.label}>Marital Status</Text>
        <Picker
          selectedValue={details.marital_status}
          onValueChange={(value) => handleChange("marital_status", value)}
          style={styles.input}
        >
          <Picker.Item label="Select Marital Status" value="" />
          <Picker.Item label="Single" value="Single" />
          <Picker.Item label="Married" value="Married" />
          <Picker.Item label="Widower" value="Widower" />
          <Picker.Item label="Divorced" value="Divorced" />
        </Picker>

        <Text style={styles.label}>Date of Birth</Text>
        <Button
          title={details.date_of_birth || "Select Date"}
          onPress={() => setDatePickerVisible(true)}
        />
        <DatePickerModal
          locale="en"
          mode="single"
          visible={datePickerVisible}
          onDismiss={() => setDatePickerVisible(false)}
          date={
            details.date_of_birth ? new Date(details.date_of_birth) : new Date()
          }
          onConfirm={(date) => {
            setDatePickerVisible(false);
            handleChange("date_of_birth", date.toISOString().split("T")[0]);
          }}
        />

        {isChanged && (
          <Button title="Save" onPress={handleSave} color="#FF7F32" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eaeaea",
    padding: 20,
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
});

export default PersonalDetails;
