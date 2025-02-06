import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Index from "./index";
import Login from "./login"; // Ensure this is the correct file path
import PayRole from "./payRole";
import Leave from "./leave";
import Chat from "./chat";
import News from "./news";
import Support from "./support";
import Logout from "./logout";
import Dashboard from "./dashboard";
import AccountSecurity from "./profileComponents/AccountSecurity";
import WorkInformation from "./profileComponents/WorkInformation";
import PersonalDetails from "./profileComponents/PersonalDetails";
import Resume from "./profileComponents/Resume";
import { RootStackParamList } from "./types"; // Import from types.ts

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="index">
        {/* Splash Screen */}
        <Stack.Screen
          name="index"
          component={Index}
          options={{ headerShown: false }}
        />

        {/* Login Screen */}
        <Stack.Screen
          name="login"
          component={Login}
          options={{ title: "Login" }}
        />

        {/* Other Screens */}
        <Stack.Screen name="payRole" component={PayRole} />
        <Stack.Screen name="leave" component={Leave} />
        <Stack.Screen name="chat" component={Chat} />
        <Stack.Screen name="news" component={News} />
        <Stack.Screen name="support" component={Support} />
        <Stack.Screen name="logout" component={Logout} />
        <Stack.Screen name="dashboard" component={Dashboard} />
        <Stack.Screen name="AccountSecurity" component={AccountSecurity} />
        <Stack.Screen name="WorkInformation" component={WorkInformation} />
        <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
        <Stack.Screen name="Resume" component={Resume} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
