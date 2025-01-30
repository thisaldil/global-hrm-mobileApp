import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Index from './index';  
import Login from './index';  // Adjust to the correct file path for Login screen
import PayRole from './payRole';  // Correct path for PayRole screen
import Leave from './leave';  // Correct path for Leave screen
import Chat from './chat';  // Correct path for Chat screen
import News from './news';  // Correct path for News screen
import Support from './support';  // Correct path for Support screen
import Logout from './logout';  // Correct path for Logout screen

// Type for Stack Navigator routes and their parameters (if needed)
type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  payRole: undefined;
  leave: undefined;
  chat: undefined;
  news: undefined;
  support: undefined;
  logout: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        {/* Splash Screen (Index) */}
        <Stack.Screen 
          name="Index" 
          component={Index} 
          options={{ headerShown: false }} // Hide the header on the splash screen
        />
        
        {/* Login Screen */}
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ title: 'Login' }}  // Customize header for Login screen
        />

        {/* Other Screens */}
        <Stack.Screen name="payRole" component={PayRole} />
        <Stack.Screen name="leave" component={Leave} />
        <Stack.Screen name="chat" component={Chat} />
        <Stack.Screen name="news" component={News} />
        <Stack.Screen name="support" component={Support} />
        <Stack.Screen name="logout" component={Logout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
