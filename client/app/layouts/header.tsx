// Header.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { t } from 'react-native-tailwindcss';
import Sidebar from '../layouts/sidebar'; // Import Sidebar

const Header = () => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false); // Sidebar visibility state

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setIsPressed(true);
    setSidebarVisible(!isSidebarVisible); // Toggle sidebar visibility
    setTimeout(() => setIsPressed(false), 200); // Reset color after 200ms
  };

  return (
    <View
      style={[
        t.flexRow,
        t.itemsCenter,
        t.justifyBetween,
        t.p4,
        t.bgWhite,
        t.borderB,
        t.borderGray200,
      ]}
    >
      {/* Company Logo */}
      <TouchableOpacity onPress={() => router.push('/dashboard')} style={[t.flexRow, t.itemsCenter]}>
        <Image
          source={require('../../assets/images/logo2.png')}
          style={{ width: 40, height: 40, resizeMode: 'contain' }}
        />
        <Text style={[t.fontBold]}>Global Hrm</Text>
      </TouchableOpacity>

      {/* Hamburger Menu Button */}
      <TouchableOpacity onPress={toggleModal} style={[t.itemsCenter, t.justifyBetween]}>
        <Icon
          name="menu-outline"
          size={28}
          style={{ color: isPressed ? '#f1823d' : '#02c3cc' }} // ✅ Color Change on Click
        />
      </TouchableOpacity>

      {/* Sidebar */}
      <Sidebar isVisible={isSidebarVisible} toggleSidebar={toggleModal} />
    </View>
  );
};

export default Header;
