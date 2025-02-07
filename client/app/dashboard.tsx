import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { t } from "react-native-tailwindcss";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfilePicture from "@/components/profilepicture";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./types";
import Actions from "@/components/actions";
import Reminders from "@/components/reminders";

const Dashboard = () => {
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [punchedStatus, setPunchedStatus] = useState("Not Punched Yet");
  const [loading, setLoading] = useState(false);
  const [empId, setEmpId] = useState<string | null>(null);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

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

  return (
    <ScrollView style={[t.flex1, t.bgGray100]}>
      <View style={[t.p6]}>
        <View style={[t.bgWhite, t.roundedLg, t.p4, t.mB6, t.shadow]}>
          <Text style={[t.textLg, t.fontSemibold, t.mB4]}>Time at Work</Text>
          <View style={[t.flexRow, t.itemsCenter, t.mB5]}>
            <View style={[t.maxW10, t.maxH10, t.roundedFull, t.border, t.borderOrange500, t.flex, t.justifyCenter, t.itemsCenter]}>
              <ProfilePicture />
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
          <View style={[t.flexWrap, t.flexRow, t.justifyBetween]}>
            <TouchableOpacity
              style={[t.p4, t.bgGray200, t.roundedFull, t.itemsCenter, t.justifyCenter, t.mB2, t.mX2, { width: '44%' }]}
              onPress={() => navigation.navigate('payRole')}

            >
              <Ionicons name="cash-outline" size={30} color="#FFA500" />
              <Text style={[t.textGray700, t.textSm]}>Payroll</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[t.p4, t.bgGray200, t.roundedFull, t.itemsCenter, t.justifyCenter, t.mB2, t.mX2, { width: '44%' }]}
              onPress={() => navigation.navigate('leave')}

            >
              <Ionicons name="time-outline" size={30} color="#FFA500" />
              <Text style={[t.textGray700, t.textSm]}>Leave</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[t.p4, t.bgGray200, t.roundedFull, t.itemsCenter, t.justifyCenter, t.mB2, t.mX2, { width: '44%' }]}
              onPress={() => navigation.navigate('chat')}

            >
              <Ionicons name="chatbubble-outline" size={30} color="#FFA500" />
              <Text style={[t.textGray700, t.textSm]}>Communication</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[t.p4, t.bgGray200, t.roundedFull, t.itemsCenter, t.justifyCenter, t.mB2, t.mX2, { width: '44%' }]}
              onPress={() => navigation.navigate('news')}

            >
              <Ionicons name="newspaper-outline" size={30} color="#FFA500" />
              <Text style={[t.textGray700, t.textSm]}>News</Text>
            </TouchableOpacity>
          </View>

        </View >

        <View style={[t.bgWhite, t.roundedLg, t.p4, t.shadow, t.mB6,]}>
          <Text style={[t.textLg, t.fontSemibold, t.mB4]}>My Activities</Text>
          <View style={[t.textCenter]}><Actions /></View>
        </View>

        <View style={[t.bgWhite, t.roundedLg, t.p4, t.shadow, t.mB6,]}>
          <Text style={[t.textLg, t.fontSemibold, t.mB4]}>My Activities</Text>
          <View style={[t.textCenter]}><Reminders /></View>
        </View>
      </View >
    </ScrollView >
  );
};

export default Dashboard;