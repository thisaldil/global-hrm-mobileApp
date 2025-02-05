import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        {Object.entries(details).map(([key, value]) =>
          key !== "gender" &&
          key !== "marital_status" &&
          key !== "date_of_birth" &&
          key !== "empId" && // Exclude empId from being rendered
          key !== "id" &&
          key !== "profilepic" ? ( // Exclude id from being rendered
            <View style={styles.inputGroup} key={key}>
              <Text style={styles.label}>
                {key.replace("_", " ").toUpperCase()}
              </Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={(text) => handleChange(key, text)}
                placeholder={`Enter ${key.replace("_", " ")}`}
                keyboardType={
                  key === "phone" || key === "emergency_contact"
                    ? "phone-pad"
                    : "default"
                }
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
          color="#FF7F32" // Use your primary theme color
          style={styles.dateButton}
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
          <Button
            title="Save"
            onPress={handleSave}
            color="#FF7F32"
            style={styles.saveButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
  },

  dateButton: {
    backgroundColor: "#FF7F32", // Background color
    paddingVertical: 12, // Padding top and bottom
    paddingHorizontal: 20, // Padding left and right
    borderRadius: 8, // Rounded corners
    fontSize: 16, // Font size for the title
    color: "#fff", // Text color (white)
    textAlign: "center", // Center the text horizontally
    fontWeight: "bold", // Make the text bold
    marginBottom: 15, // Space below the button
    width: "100%", // Full width
  },

  saveButton: {
    marginTop: 20,
    backgroundColor: "#FF7F32",
    color: "#fff",
    borderRadius: 8,
  },
});

export default PersonalDetails;
