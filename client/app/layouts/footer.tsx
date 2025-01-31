// Footer.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons
import { t } from 'react-native-tailwindcss';

const Footer = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('dashboard'); // Track active tab

  const handlePress = (tabName: string, route: string) => {
    setActiveTab(tabName); // Update active tab
    router.push(route as any); // Navigate to the route
  };

  const defaultColor = '#02c3cc'; // Default color
  const activeColor = '#f1823d'; // Active color

  return (
    <View style={[t.flexRow, t.justifyAround, t.itemsCenter, t.bgWhite, t.p4, t.borderT, t.borderGray200]}>
      {/* Home Button */}
      <TouchableOpacity onPress={() => handlePress('dashboard', '../dashboard')} style={[t.itemsCenter]}>
        <Icon name="home-outline" size={24} style={{ color: activeTab === 'dashboard' ? activeColor : defaultColor }} />
        <Text style={{ fontSize: 12, color: activeTab === 'dashboard' ? activeColor : defaultColor }}>Dashboard</Text>
      </TouchableOpacity>

      {/* Reminder Button */}
      <TouchableOpacity onPress={() => handlePress('reminder', '../reminder')} style={[t.itemsCenter]}>
        <Icon name="alarm-outline" size={26} style={{ color: activeTab === 'reminder' ? activeColor : defaultColor }} />
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

export default Footer;
