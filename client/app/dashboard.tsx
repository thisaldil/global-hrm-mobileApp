import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { t } from "react-native-tailwindcss";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = () => {
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [punchedStatus, setPunchedStatus] = useState("Not Punched Yet");
  const [loading, setLoading] = useState(false);
  const [empId, setEmpId] = useState<string | null>(null);

  AsyncStorage.getItem("empId").then((value) => {
    setEmpId(value);
  });


  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://global-hrm-mobile-server.vercel.app/employees/getCurrentDateAttendance/${empId}`
        );

        if (response.data.punch_in_time) {
          setPunchInTime(response.data.punch_in_time);
          setPunchedStatus("Punched In");
        }

        if (response.data.punch_out_time) {
          setPunchOutTime(response.data.punch_out_time);
          setPunchedStatus("Punched Out");
        }
      } catch (error) {
        Alert.alert("Error", "Unable to fetch today's attendance.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [empId]);

  const handlePunch = (type: "in" | "out") => {
    Alert.alert(
      "Punch",
      `You clicked Punch ${type === "in" ? "In" : "Out"}.`,
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView style={[t.flex1, t.bgGray100]}>
      <View style={[t.p6]}>
        <View style={[t.bgWhite, t.roundedLg, t.p4, t.mB6, t.shadow]}>
          <Text style={[t.textLg, t.fontSemibold, t.mB4]}>Time at Work</Text>
          <View style={[t.flexRow, t.itemsCenter, t.mB5]}>
            <View style={[t.w10, t.h10, t.roundedFull, t.border, t.borderOrange500, t.flex, t.justifyCenter, t.itemsCenter]}>
              <Ionicons name="person-circle-outline" size={32} color="#FFA500" />
            </View>
            <View style={[t.mL3]}>
              <Text style={[t.textOrange600, t.fontSemibold]}>{punchedStatus}</Text>
              <Text style={[t.textSm]}>{punchInTime || "Not Punched In Yet"}</Text>
              <Text style={[t.textSm]}>{punchOutTime || "Not Punched Out Yet"}</Text>
            </View>
          </View>
          {loading && <ActivityIndicator color="#FFA500" />}
        </View>

        <View style={[t.bgWhite, t.roundedLg, t.p4, t.mB6, t.shadow]}>
          <Text style={[t.textLg, t.fontSemibold, t.mB4]}>Quick Actions</Text>
          <View style={[t.flexRow, t.justifyBetween]}>
            <TouchableOpacity
              style={[
                t.p4,
                t.bgGray100,
                t.roundedFull,
                t.itemsCenter,
                t.justifyCenter,
                t.mB2,
                t.mX2,
              ]}
              onPress={() => handlePunch("in")}
            >
              <Ionicons name="log-in-outline" size={32} color="#FFA500" />
              <Text style={[t.textGray700, t.textSm]}>Punch In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                t.p4,
                t.bgGray100,
                t.roundedFull,
                t.itemsCenter,
                t.justifyCenter,
                t.mB2,
                t.mX2,
              ]}
              onPress={() => handlePunch("out")}
            >
              <Ionicons name="log-out-outline" size={32} color="#FFA500" />
              <Text style={[t.textGray700, t.textSm]}>Punch Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[t.bgWhite, t.roundedLg, t.p4, t.shadow]}>
          <Text style={[t.textLg, t.fontSemibold, t.mB4]}>Employee Distribution</Text>
          <Text style={[t.textCenter, t.textSm]}>Pie chart placeholder</Text>
          {/* Add Pie Chart component here for React Native */}
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;