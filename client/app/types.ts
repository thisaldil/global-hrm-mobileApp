import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Index: undefined;
  Login: undefined;
  dashboard: undefined;
  payRole: undefined;
  leave: undefined;
  chat: undefined;
  news: undefined;
  support: undefined;
  logout: undefined;
};

export type NavigationProps = StackNavigationProp<RootStackParamList>;