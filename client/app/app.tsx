// App.tsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Index from "./index"; // Your Splash screen
import Login from "./index"; // Your index screen
import AccountSecurity from "./profileComponents/AccountSecurity";
import WorkInformation from "./profileComponents/WorkInformation";
import PersonalDetails from "./profileComponents/PersonalDetails";
import Resume from "./profileComponents/Resume";

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
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="AccountSecurity" component={AccountSecurity} />
        <Stack.Screen name="WorkInformation" component={WorkInformation} />
        <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
        <Stack.Screen name="Resume" component={Resume} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
