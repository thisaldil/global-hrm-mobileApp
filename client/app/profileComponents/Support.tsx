import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  StyleSheet,
  Picker,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Support = ({ onClose }) => {
  const [formData, setFormData] = useState({
    subject: "",
    email: "",
    department: "",
    otherSubject: "",
    message: "",
  });

  const [modalVisible, setModalVisible] = useState(true);

  // Sample departments
  const departments = ["HR", "Finance", "IT", "Sales", "Marketing"];

  // Sample subjects
  const subjects = [
    "Financial",
    "Health Care",
    "IT Solution",
    "Job Progress",
    "Loan Services",
    "Other",
  ];

  // Retrieve empId from AsyncStorage
  const [empId, setEmpId] = useState(null);

  React.useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      setEmpId(storedEmpId);
    };
    fetchEmpId();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!empId) {
      console.error("Employee ID not found");
      return;
    }

    const supportData = {
      empId,
      ...formData,
    };

    console.log("Form Data:", supportData);

    try {
      const response = await fetch(
        `http://localhost:4000/employees/support/${empId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(supportData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Support request submitted:", data);
        Alert.alert("Success", "Support request submitted");
        onClose(); // Close the modal or support form
      } else {
        console.error("Error submitting form:", data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert("Error", "Failed to submit request.");
    }
  };

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Contact Support</Text>

          <TextInput
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleInputChange("email", text)}
            style={styles.input}
            keyboardType="email-address"
            required
          />

          <Text style={styles.label}>Department</Text>
          <Picker
            selectedValue={formData.department}
            onValueChange={(itemValue) =>
              handleInputChange("department", itemValue)
            }
            style={styles.input}
          >
            <Picker.Item label="Select Department" value="" />
            {departments.map((dept, index) => (
              <Picker.Item key={index} label={dept} value={dept} />
            ))}
          </Picker>

          <Text style={styles.label}>Subject</Text>
          <Picker
            selectedValue={formData.subject}
            onValueChange={(itemValue) =>
              handleInputChange("subject", itemValue)
            }
            style={styles.input}
          >
            <Picker.Item label="Select Subject" value="" />
            {subjects.map((subject, index) => (
              <Picker.Item key={index} label={subject} value={subject} />
            ))}
          </Picker>

          {formData.subject === "Other" && (
            <TextInput
              placeholder="Please specify"
              value={formData.otherSubject}
              onChangeText={(text) => handleInputChange("otherSubject", text)}
              style={styles.input}
            />
          )}

          <Text style={styles.label}>Message</Text>
          <TextInput
            placeholder="Enter your message"
            value={formData.message}
            onChangeText={(text) => handleInputChange("message", text)}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
            required
          />

          <View style={styles.buttonContainer}>
            <Button title="Submit" onPress={handleSubmit} />
            <Button title="Cancel" onPress={onClose} color="gray" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default Support;
