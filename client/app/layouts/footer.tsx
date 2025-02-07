import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { t } from 'react-native-tailwindcss';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Footer = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [hasReminder, setHasReminder] = useState<boolean>(false); // Track if there are reminders for today
  const [empId, setEmpId] = useState<string | null>(null); // Store empId
  
  const defaultColor = '#02c3cc'; 
  const activeColor = '#f1823d'; 

  useEffect(() => {
    AsyncStorage.getItem('empId').then((storedEmpId) => {
      setEmpId(storedEmpId);
      fetchRemindersForToday(storedEmpId); // Fetch reminders when empId is available
    });
  }, []);

  const fetchRemindersForToday = async (empId: string | null) => {
    if (empId) {
      try {
        const today = new Date().toISOString().slice(0, 10); // Get today's date in "YYYY-MM-DD" format
        const response = await axios.get(`https://global-hrm-mobile-server.vercel.app/employees/getAllReminders/${empId}`, {
          params: { date: today },
        });

        // If there are reminders for today, set `hasReminder` to true
        setHasReminder(response.data.length > 0);
      } catch (error) {
        console.error("Error fetching reminders:", error);
      }
    }
  };

  const handlePress = (tabName: string, route: string) => {
    setActiveTab(tabName);
    router.push(route as any);
  };

  return (
    <View style={[t.flexRow, t.justifyAround, t.itemsCenter, t.bgWhite, t.p4, t.borderT, t.borderGray200]}>
      {/* Home Button */}
      <TouchableOpacity onPress={() => handlePress('dashboard', '../dashboard')} style={[t.itemsCenter]}>
        <Icon name="home-outline" size={24} style={{ color: activeTab === 'dashboard' ? activeColor : defaultColor }} />
        <Text style={{ fontSize: 12, color: activeTab === 'dashboard' ? activeColor : defaultColor }}>Dashboard</Text>
      </TouchableOpacity>

      {/* Reminder Button */}
      <TouchableOpacity onPress={() => handlePress('reminder', '../reminder')} style={[t.itemsCenter]}>
        <View style={[t.itemsCenter]}>
          <Icon name="alarm-outline" size={26} style={{ color: activeTab === 'reminder' ? activeColor : defaultColor }} />
          {hasReminder && (
            <View style={styles.reminderDot} />
          )}
        </View>
        <Text style={{ fontSize: 12, color: activeTab === 'reminder' ? activeColor : defaultColor }}>Reminder</Text>
      </TouchableOpacity>

      {/* Message Button */}
      <TouchableOpacity onPress={() => handlePress('message', '../message')} style={[t.itemsCenter]}>
        <Icon name="chatbubble-outline" size={24} style={{ color: activeTab === 'message' ? activeColor : defaultColor }} />
        <Text style={{ fontSize: 12, color: activeTab === 'message' ? activeColor : defaultColor }}>Message</Text>
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity onPress={() => handlePress('profile', '../profile')} style={[t.itemsCenter]}>
        <Icon name="person-outline" size={24} style={{ color: activeTab === 'profile' ? activeColor : defaultColor }} />
        <Text style={{ fontSize: 12, color: activeTab === 'profile' ? activeColor : defaultColor }}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the dot
const styles = {
  reminderDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f1823d',
  } as ViewStyle,
};

export default Footer;