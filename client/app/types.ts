import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  dashboard: undefined;
};

export type NavigationProps = StackNavigationProp<RootStackParamList>;