import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { t } from "react-native-tailwindcss";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "./navigation/types"; // Import the navigation types
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const Login: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post("https://global-hrm-mobile-server.vercel.app/auth/login", {
        email,
        password,
      });

      const { token, employeeId, email: userEmail, role } = res.data;

      // Save data to AsyncStorage
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("empId", employeeId);
      await AsyncStorage.setItem("email", userEmail);
      await AsyncStorage.setItem("role", role);
      await AsyncStorage.setItem("loginTimestamp", JSON.stringify(Date.now()));

      Alert.alert("Success", "Login Successful!");

      // Navigate to Dashboard screen
      navigation.navigate("Dashboard"); // Now TypeScript will ensure this is valid
    } catch (err) {
      console.error(err);
      setError("Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[t.flex1, t.bgGray100, t.itemsCenter, t.justifyCenter, t.pX4]}>
      <Text style={[t.text2xl, t.fontBold, t.textGray700, t.mB6]}>Login</Text>
      {error && <Text style={[t.textRed500, t.textCenter, t.mB4]}>{error}</Text>}

      <View style={[t.wFull, t.mB4]}>
        <Text style={[t.textSm, t.textGray500, t.mB2]}>
          <Icon name="mail-outline" size={16} style={[t.mR2]} /> Email
        </Text>
        <TextInput
          style={[t.border, t.borderGray300, t.roundedLg, t.p3, t.bgWhite]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={[t.wFull, t.mB6]}>
        <Text style={[t.textSm, t.textGray500, t.mB2]}>
          <Icon name="key-outline" size={16} style={[t.mR2]} /> Password
        </Text>
        <TextInput
          style={[t.border, t.borderGray300, t.roundedLg, t.p3, t.bgWhite]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[t.bgOrange500, t.h12, t.roundedLg, t.itemsCenter, t.justifyCenter, t.wFull, t.mB4]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[t.textWhite, t.textLg, t.fontMedium]}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Login;