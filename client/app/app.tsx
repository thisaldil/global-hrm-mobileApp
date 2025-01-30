import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { RootStackParamList } from "./types"; // Import from types.ts

import Index from "./index";
import Login from "./login";  // Corrected path for Login
import PayRole from "./payRole";
import Leave from "./leave";
import Chat from "./chat";
import News from "./news";
import Support from "./support";
import Logout from "./logout";
import Dashboard from "./dashboard";

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="index">
        <Stack.Screen name="index" component={Index} />
        <Stack.Screen name="login" component={Login} options={{ title: "Login" }} />
        <Stack.Screen name="dashboard" component={Dashboard} />
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