import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Picker,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";

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
    dependents: 0,
  });
  const [isChanged, setIsChanged] = useState(false);
  const empId = localStorage.getItem("empId");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/employees/getPersonalDetails/${empId}`
        );
        const data = response.data || {};

        // Manually format the date without time zone adjustments
        if (data.date_of_birth) {
          const date = new Date(data.date_of_birth);
          const year = date.getFullYear();
          const month = `0${date.getMonth() + 1}`.slice(-2);
          const day = `0${date.getDate()}`.slice(-2);
          data.date_of_birth = `${year}-${month}-${day}`;
        }

        setDetails(data);
      } catch (err) {
        console.log("Error fetching personal details:", err);
      }
    };
    fetchDetails();
  }, [empId]);

  const handleChange = (name, value) => {
    setDetails({ ...details, [name]: value });
    setIsChanged(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4000/employees/savePersonalDetails/${empId}`,
        details
      );
      console.log(response.data.message);
      Alert.alert("Details updated successfully");
      setIsChanged(false);
    } catch (err) {
      console.log("Error saving personal details:", err);
      Alert.alert("Error updating personal details");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={details.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Personal Email</Text>
          <TextInput
            style={styles.input}
            value={details.email}
            onChangeText={(text) => handleChange("email", text)}
            placeholder="Enter your Email"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Personal Phone</Text>
          <TextInput
            style={styles.input}
            value={details.phone}
            onChangeText={(text) => handleChange("phone", text)}
            placeholder="Enter your phone"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Emergency Contact</Text>
          <TextInput
            style={styles.input}
            value={details.emergency_contact}
            onChangeText={(text) => handleChange("emergency_contact", text)}
            placeholder="Enter emergency contact"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Personal Address</Text>
          <TextInput
            style={styles.input}
            value={details.address}
            onChangeText={(text) => handleChange("address", text)}
            placeholder="Enter your address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date Of Birth</Text>
          <TextInput
            style={styles.input}
            value={details.date_of_birth}
            onChangeText={(text) => handleChange("date_of_birth", text)}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputGroup}>
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
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={details.country}
            onChangeText={(text) => handleChange("country", text)}
            placeholder="Enter your country"
          />
        </View>

        <View style={styles.inputGroup}>
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
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Dependents</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(details.dependents)}
            onChangeText={(text) => handleChange("dependents", text)}
            placeholder="Enter number of dependents"
          />
        </View>

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
