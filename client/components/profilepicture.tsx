import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { t } from 'react-native-tailwindcss';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const defaultAvatar = require('../assets/images/avatar.png');

const ProfilePicture = () => {
  const [avatar, setAvatar] = useState(defaultAvatar);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const empId = await AsyncStorage.getItem('empId');
        if (!empId) return;

        const response = await axios.get(`https://global-hrm-mobile-server.vercel.app/employees/getProfileImage/${empId}`);
        if (response.data.imageUrl) {
          setAvatar({ uri: response.data.imageUrl });
        }
      } catch (err) {
        console.log('Error fetching employee profile pic:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePic();
  }, []);

  return (
    <View style={[t.itemsCenter, t.justifyCenter]}>
      {loading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <Image source={avatar} style={[t.w24, t.h24, t.roundedFull]} />
      )}
    </View>
  );
};

export default ProfilePicture;
