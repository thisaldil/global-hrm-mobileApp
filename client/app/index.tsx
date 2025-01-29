import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useRouter } from 'expo-router';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();

        // Simulate loading for 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));

        await SplashScreen.hideAsync();

        // Navigate to login page
        router.replace('/login');  // This replaces the current screen

      } catch (error) {
        console.warn('Error during splash screen handling:', error);
      }
    };

    prepareApp();
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

export default Index;
