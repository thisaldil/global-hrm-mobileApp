import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const Splash: React.FC = () => {
  useEffect(() => {
    // Prevent the splash screen from auto-hiding
    SplashScreen.preventAutoHideAsync();
    
    // Simulate a loading process or initialization
    setTimeout(async () => {
      await SplashScreen.hideAsync();  // Hide the splash screen manually after 3 seconds
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Text>Welcome to the App!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Splash;
