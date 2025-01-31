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

// Define the type for stack navigator
type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  PayRole: undefined;
  Leave: undefined;
  Chat: undefined;
  News: undefined;
  Support: undefined;
  Logout: undefined;
  Dashboard: undefined;
  AccountSecurity: undefined;
  WorkInformation: undefined;
  PersonalDetails: undefined;
  Resume: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        {/* Splash Screen */}
        <Stack.Screen
          name="Index"
          component={Index}
          options={{ headerShown: false }}
        />

        {/* Login Screen */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ title: "Login" }}
        />

        {/* Other Screens */}
        <Stack.Screen name="PayRole" component={PayRole} />
        <Stack.Screen name="Leave" component={Leave} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="News" component={News} />
        <Stack.Screen name="Support" component={Support} />
        <Stack.Screen name="Logout" component={Logout} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="AccountSecurity" component={AccountSecurity} />
        <Stack.Screen name="WorkInformation" component={WorkInformation} />
        <Stack.Screen name="PersonalDetails" component={PersonalDetails} />
        <Stack.Screen name="Resume" component={Resume} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
