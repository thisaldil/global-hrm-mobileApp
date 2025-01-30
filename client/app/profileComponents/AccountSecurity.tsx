import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountSecurity = () => {
  const [editable, setEditable] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [empId, setEmpId] = useState("");

  // Password validation logic
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    return regex.test(password);
  };

  useEffect(() => {
    const fetchEmpId = async () => {
      const storedEmpId = await AsyncStorage.getItem("empId");
      setEmpId(storedEmpId);
    };

    fetchEmpId();
  }, []);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        if (empId) {
          const response = await axios.get(
            `http://localhost:4000/employees/getEmployee/${empId}`
          );
          setEmail(response.data.email || "");
        }
      } catch (err) {
        console.log("Error fetching email:", err);
      }
    };

    fetchEmail();
  }, [empId]);

  const handleSendResetCode = async () => {
    try {
      const res = await axios.post(
        "http://localhost:4000/employees/requestPasswordReset",
        { email }
      );
      if (res.status === 200) {
        setEditable(true);
        Alert.alert("Success", "Reset code sent successfully.");
      }
    } catch (error) {
      setError("Failed to send reset code. Please try again.");
      console.log("Error sending reset code:", error);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/employees/resetPassword",
        {
          resetCode,
          newPassword,
        }
      );

      if (res.status === 200) {
        setEditable(false);
        setNewPassword("");
        setConfirmPassword("");
        setResetCode("");
        Alert.alert("Success", "Password updated successfully.");
      }
    } catch (error) {
      setError("Failed to reset password. Please try again.");
      console.log("Error resetting password:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Password Management</Text>

      {editable ? (
        <View style={styles.form}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TextInput
            style={styles.input}
            placeholder="Enter the reset code"
            value={resetCode}
            onChangeText={setResetCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your new password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm your new password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditable(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.sendCodeButton}
          onPress={handleSendResetCode}
        >
          <Text style={styles.buttonText}>Send Reset Code</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: "#eaeaea",
    padding: 20,
    borderRadius: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  form: {
    marginTop: 10,
  },
  input: {
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#ff7f00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
  },
  sendCodeButton: {
    backgroundColor: "#ff7f00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelText: {
    color: "gray",
  },
});

export default AccountSecurity;
