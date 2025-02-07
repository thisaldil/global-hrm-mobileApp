import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  index: undefined;
  login: undefined;
  dashboard: undefined;
  payRole: undefined;
  leave: undefined;
  chat: undefined;
  news: undefined;
  support: undefined;
  logout: undefined;
  postlist: undefined;
  AccountSecurity: undefined;
  WorkInformation: undefined;
  PersonalDetails: undefined;
  Resume: undefined;
  forgotpassword: undefined;
};

export type NavigationProps = StackNavigationProp<RootStackParamList>;