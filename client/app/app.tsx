// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Index from './index';  // Your Splash screen
import Login from './login';  // Your Login screen

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen
          name="Index"
          component={Index}
          options={{ headerShown: false }} // Hide the header for the splash screen
        />
        <Stack.Screen
          name="Login"
          component={Login}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
