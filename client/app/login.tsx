import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { t } from "react-native-tailwindcss";
// import ForgotPasswordModal from "./ForgotPassword"; // Ensure this is adapted for React Native
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);

        try {
            const res = await axios.post("https://global-hrm-mobile-server.vercel.app/auth/login", {
                email,
                password,
            });

            const { token, employeeId, email: userEmail, role } = res.data;
            // Save data to local storage (use AsyncStorage for RN)
            Alert.alert("Success", "Login Successful!");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[t.flex1, t.bgGray100, t.itemsCenter, t.justifyCenter, t.pX4]}>
            <Image source={require("../assets/images/logo2.png")} style={[t.h24, t.w24, t.mB6]} />
            <Text style={[t.text2xl, t.fontBold, t.textGray700, t.mB6]}>Login</Text>

            {error && <Text style={[t.textRed500, t.textCenter, t.mB4]}>{error}</Text>}

            <View style={[t.wFull, t.mB4]}>
                <Text style={[t.textSm, t.textGray500, t.mB2]}>
                    <FontAwesome name="envelope" size={16} style={[t.mR2]} /> Email
                </Text>
                <TextInput
                    style={[t.border, t.borderGray300, t.roundedBSm, t.p3, t.bgWhite]}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={[t.wFull, t.mB6]}>
                <Text style={[t.textSm, t.textGray500, t.mB2]}>
                    <FontAwesome name="key" size={16} style={[t.mR2]} /> Password
                </Text>
                <TextInput
                    style={[t.border, t.borderGray300, t.roundedBSm, t.p3, t.bgWhite]}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Login;