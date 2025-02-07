import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import axios from "axios";
import moment from "moment";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { t } from "react-native-tailwindcss";

interface LeaveRequest {
  id: string;
  leave_type: string;
  createdAt: string;
}

interface FinancialRequest {
  id: string;
  request_type: string;
  created_at: string;
}

const Actions = () => {
  const router = useRouter();
  const [leaveRequestList, setLeaveRequestList] = useState<LeaveRequest[]>([]);
  const [financialRequestList, setFinancialRequestList] = useState<FinancialRequest[]>([]);
  const [empId, setEmpId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedEmpId = await AsyncStorage.getItem("empId");
        setEmpId(storedEmpId);

        if (!storedEmpId) return;

        const requestLeave = await axios.get<LeaveRequest[]>(
          `https://global-hrm-mobile-server.vercel.app/employees/getLeaveRequest/${storedEmpId}`
        );

        const requestFinancial = await axios.get<FinancialRequest[]>(
          `https://global-hrm-mobile-server.vercel.app/employees/getFinancialRequests/${storedEmpId}`
        );

        const currentDate = moment().startOf("day");

        const todayLeaves = requestLeave.data.filter((request) =>
          moment(request.createdAt).isSame(currentDate, "day")
        );

        const todayFinancials = requestFinancial.data.filter((request) =>
          moment(request.created_at).isSame(currentDate, "day")
        );

        setLeaveRequestList(todayLeaves);
        setFinancialRequestList(todayFinancials);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <View>
      {leaveRequestList.length > 0 && (
        <TouchableOpacity onPress={() => router.push("/leave")}>
          <View style={[t.bgGray100, t.roundedLg, t.p4]}>
            {leaveRequestList.map((leave) => (
              <View key={leave.id} style={[t.flexRow, t.itemsCenter]}>
                <Ionicons name="calendar-outline" size={20} color="red" />
                <Text style={[t.textBase, t.textGray700, t.mL2]}>Leave Request - {leave.leave_type}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}
      {financialRequestList.length > 0 && (
        <TouchableOpacity onPress={() => router.push("/payRole")}>
          <View style={[t.bgGray100, t.roundedLg, t.p4, t.mT5]}>
            {financialRequestList.map((financial) => (
              <View key={financial.id} style={[t.flexRow, t.itemsCenter]}>
                <Ionicons name="wallet-outline" size={20} color="red" />
                <Text style={[t.textBase, t.textGray700]}>
                  Financial Request - {financial.request_type}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}
      {leaveRequestList.length === 0 && financialRequestList.length === 0 && (
        <Text style={[t.textSm, t.textGray500, t.mT4, t.textCenter]}>No actions available for today.</Text>
      )}
    </View>
  );
};

export default Actions;
