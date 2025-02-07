import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { t } from "react-native-tailwindcss";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "./types";
import { StackNavigationProp } from "@react-navigation/stack";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;
    return regex.test(password);
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (step === 1) {
      try {
        const res = await axios.post("https://global-hrm-mobile-server.vercel.app/auth/requestPasswordReset", { email });

        if (res.status === 200) {
          setStep(2);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("Email not found. Please enter a valid email.");
        } else {
          setError("Failed to send reset code. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword(newPassword)) {
      setError("Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post("https://global-hrm-mobile-server.vercel.app/auth/resetPassword", {
        resetCode,
        newPassword,
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError("Invalid reset code. Please try again.");
      } else if (error.response && error.response.status === 400) {
        setError("Reset code has expired. Please request a new one.");
      } else {
        setError("Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <View style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgGray200]}>
      <View style={[t.bgWhite, t.roundedLg, t.p6, t.w4_5]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[t.absolute, t.top0, t.right0, t.p2]}>
          <Ionicons name="close-outline" size={24} color="gray" />
        </TouchableOpacity>

        <Text style={[t.text2xl, t.fontSemibold, t.mB4, t.textCenter]}>
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </Text>

        {error && <Text style={[t.textRed600, t.mB3]}>{error}</Text>}

        {step === 1 && (
          <View>
            <TextInput
              style={[t.border, t.borderGray400, t.pX4, t.pY2, t.roundedLg, t.mB4]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <TouchableOpacity onPress={handleNextStep} style={[t.bgOrange500, t.pX4, t.pY2, t.roundedLg, t.wFull]}>
              <Text style={[t.textWhite, t.textCenter]}>
                {loading ? "Sending Reset Code..." : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View>
            <TextInput
              style={[t.border, t.borderGray400, t.pX4, t.pY2, t.roundedLg, t.mB4]}
              value={resetCode}
              onChangeText={setResetCode}
              placeholder="Enter reset code"
            />
            <TextInput
              style={[t.border, t.borderGray400, t.pX4, t.pY2, t.roundedLg, t.mB4]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
            <TextInput
              style={[t.border, t.borderGray400, t.pX4, t.pY2, t.roundedLg, t.mB4]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
            />
            <TouchableOpacity onPress={handleSubmit} style={[t.bgOrange500, t.pX4, t.pY2, t.roundedLg, t.wFull]}>
              <Text style={[t.textWhite, t.textCenter]}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default ForgotPassword;