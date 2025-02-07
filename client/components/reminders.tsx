import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "react-native-tailwindcss";

interface Alert {
    id: string;
    resource: string;
    alert: number;
    returneddate: string;
}


const Reminders = () => {
    const [learningReminders, setLearningReminders] = useState([]);
    const [otherReminders, setOtherReminders] = useState([]);
    const [trainingReminders, setTrainingReminders] = useState([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [empId, setEmpId] = useState<string | null>(null);

    const fetchReminders = async () => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString("en-CA");

        try {
            const storedEmpId = await AsyncStorage.getItem("empId");
            setEmpId(storedEmpId);

            if (!storedEmpId) return;

            const learningResponse = await axios.get(
                `https://global-hrm-mobile-server.vercel.app/employees/getReminders/${storedEmpId}`,
                { params: { date: formattedDate, subject: "Learning" } }
            );
            setLearningReminders(learningResponse.data);

            const otherResponse = await axios.get(
                `https://global-hrm-mobile-server.vercel.app/employees/getReminders/${storedEmpId}`,
                { params: { date: formattedDate, subject: "Others" } }
            );
            setOtherReminders(otherResponse.data);

            const alertsResponse = await axios.get(
                `https://global-hrm-mobile-server.vercel.app/admin/getAllocatedResources/${storedEmpId}`
            );
            setAlerts(alertsResponse.data.filter((alert: Alert) => alert.alert === 1));

            const trainingResponse = await axios.get(
                `https://global-hrm-mobile-server.vercel.app/admin/getTrainingReminder/${storedEmpId}`
            );
            setTrainingReminders(trainingResponse.data);
        } catch (error) {
            console.log("Error fetching reminders:", error);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-CA");
    };

    return (
        <View>
            {learningReminders.length > 0 && (
                <View style={[t.bgGray100, t.roundedLg, t.p4]}>
                    {learningReminders.map((reminder: any) => (
                        <View key={reminder.id} style={[t.flexRow, t.itemsCenter]}>
                            <Ionicons name="book-outline" size={20} color="red" />
                            <Text style={[t.textBase, t.textGray700, t.mL2]}>{reminder.reminder}</Text>
                        </View>
                    ))}
                </View>
            )}

            {otherReminders.length > 0 && (
                <View style={[t.bgGray100, t.roundedLg, t.p4, t.mT5]}>
                    {otherReminders.map((reminder: any) => (
                        <View key={reminder.id} style={[t.flexRow, t.itemsCenter]}>
                            <Ionicons name="calendar-outline" size={20} color="blue" />
                            <Text style={[t.textBase, t.textGray700, t.mL2]}>{reminder.reminder}</Text>
                        </View>
                    ))}
                </View>
            )}

            {trainingReminders.length > 0 && (
                <View style={[t.bgGray100, t.roundedLg, t.p4, t.mT5]}>
                    {trainingReminders.map((reminder: any) => (
                        <View key={reminder.id} style={[t.flexRow, t.itemsCenter]}>
                            <Ionicons name="notifications-outline" size={20} color="orange" />
                            <Text style={[t.textBase, t.textGray700, t.mL2]}>{reminder.training}</Text>
                        </View>
                    ))}
                </View>
            )}

            {alerts.length > 0 && (
                <View style={[t.mT5]}>
                    {alerts.map((alert: any) => (
                        <View key={alert.id} style={[t.flexRow, t.itemsCenter, t.bgRed200, t.p4, t.roundedLg]}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="red" />
                            <Text style={[t.textBase, t.textLeft, t.textRed700, t.mL2]}>
                                {alert.resource} allocated to you is delayed. {"\n"}Return date: {formatDate(alert.returneddate)}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {learningReminders.length === 0 && otherReminders.length === 0 && alerts.length === 0 && (
                <Text style={[t.textSm, t.textGray500, t.mT4, t.textCenter]}>No reminders available for today.</Text>
            )}
        </View>
    );
};

export default Reminders;