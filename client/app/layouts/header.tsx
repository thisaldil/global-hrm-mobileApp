import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { t } from 'react-native-tailwindcss';

const Header = () => {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(false);

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200); // Reset color after 200ms
    // Your modal logic here...
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
      <TouchableOpacity onPress={() => router.push('/home')}>
        <Image 
          source={require('../../assets/images/logo2.png')}
          style={{ width: 40, height: 40, resizeMode: 'contain' }} 
        />
      </TouchableOpacity>

      {/* Hamburger Menu Button */}
      <TouchableOpacity onPress={toggleModal} style={[t.itemsCenter]}>
        <Icon
          name="menu-outline"
          size={28}
          style={[{ color: isPressed ? '#f1823d' : '#02c3cc' }]} // ✅ Color Change on Click
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
