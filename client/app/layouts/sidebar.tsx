import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons'; // Using Ionicons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types";

const Sidebar = ({ isVisible, toggleSidebar }: { isVisible: boolean, toggleSidebar: () => void }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [iconPosition] = useState(new Animated.Value(-80)); // Start the icon above the sidebar
  const [activeItem, setActiveItem] = useState<string>(''); // Track active menu item
  const activeColor = '#f1823d'; // Active color

  useEffect(() => {
    // Animate the hamburger menu icon's position
    Animated.timing(iconPosition, {
      toValue: isVisible ? 10 : -50, // Moves down to top when sidebar opens, and goes back up when closed
      duration: 600, // Adjusted duration for speed
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  // Function to handle menu item press and set active item
  const handlePress = async (item: string, route: keyof RootStackParamList) => {
    setActiveItem(item);
    await AsyncStorage.clear();
    console.log('Local Storage cleared!');
    navigation.navigate(route);
    toggleSidebar();
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      onBackdropPress={toggleSidebar}
      swipeDirection="right"
      onSwipeComplete={toggleSidebar}
      animationIn="slideInRight"
      animationOut="slideOutRight"
    >
      <View style={styles.sidebar}>

        {/* Logo at the Top-Right */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/logo2.png')} style={styles.logo} />
        </View>

        {/* Main Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePress('payRole', 'payRole')}
          >
            <Icon
              name="cash-outline"
              size={24}
              style={[styles.icon, activeItem === 'payRole' && { color: activeColor }]}
            />
            <Text style={[styles.menuText, activeItem === 'payRole' && { color: activeColor }]}>Pay Role</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePress('leave', 'leave')}
          >
            <Icon
              name="time-outline"
              size={24}
              style={[styles.icon, activeItem === 'leave' && { color: activeColor }]}
            />
            <Text style={[styles.menuText, activeItem === 'leave' && { color: activeColor }]}>Leave & Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePress('chat', 'chat')}
          >
            <Icon
              name="chatbubble-outline"
              size={24}
              style={[styles.icon, activeItem === 'chat' && { color: activeColor }]}
            />
            <Text style={[styles.menuText, activeItem === 'chat' && { color: activeColor }]}>Chats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePress('news', 'news')}
          >
            <Icon
              name="newspaper-outline"
              size={24}
              style={[styles.icon, activeItem === 'news' && { color: activeColor }]}
            />
            <Text style={[styles.menuText, activeItem === 'news' && { color: activeColor }]}>News</Text>
          </TouchableOpacity>

          {/* Separator Line */}
          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePress('help', 'support')}
          >
            <Icon
              name="help-circle-outline"
              size={24}
              style={[styles.icon, activeItem === 'help' && { color: activeColor }]}
            />
            <Text style={[styles.menuText, activeItem === 'help' && { color: activeColor }]}>Support</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Section - Logout */}
        <View style={styles.bottomMenu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handlePress('logout', 'login')}
          >
            <Icon
              name="log-out-outline"
              size={24}
              style={[styles.icon, styles.logoutIcon, activeItem === 'logout' && { color: activeColor }]}
            />
            <Text style={[styles.menuText, styles.logoutText, activeItem === 'logout' && { color: activeColor }]}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Hamburger Menu Icon */}
        <Animated.View
          style={[
            styles.hamburgerContainer,
            {
              transform: [
                {
                  translateY: iconPosition.interpolate({
                    inputRange: [-50, 10], // Start off-screen and come down to position
                    outputRange: [-50, 10], // Moves down to top
                  }),
                },
              ],
            },
          ]}
        >
          {/* White square behind the icon */}
          <View style={styles.hamburgerBackground}>
            <TouchableOpacity onPress={toggleSidebar}>
              <Icon name="menu-outline" size={30} style={styles.hamburgerIcon} />
            </TouchableOpacity>
          </View>
        </Animated.View>

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 20, // Increased top padding
    width: 250, // Sidebar width
    borderTopLeftRadius: 17, // Rounded top-left
    borderBottomLeftRadius: 17, // Rounded bottom-left
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: -3, height: 3 }, // Shadow direction
    shadowOpacity: 0.2, // Shadow visibility
    shadowRadius: 5, // Spread of shadow
    elevation: 5, // Android shadow
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-end', // Align the sidebar to the right
  },
  logoContainer: {
    alignItems: 'flex-end', // Aligns logo to the right
    marginBottom: 10, // Space below logo
  },
  logo: {
    width: 40, // Adjust width
    height: 40, // Adjust height
    resizeMode: 'contain', // Keep aspect ratio
  },
  menuContainer: {
    flex: 1, // Push the bottom items down
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
  bottomMenu: {
    paddingTop: 10, // Increased top padding for bottom section
  },
  menuItem: {
    flexDirection: 'row', // Align the icon and text horizontally
    alignItems: 'center', // Center the items vertically
    paddingVertical: 20, // Increased top padding for each item
  },
  icon: {
    marginRight: 10, // Space between icon and text
    color: '#027b92', // Dark blue color
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#02c3cc', // Dark blue text
  },
  logoutText: {
    color: '#d9534f', // Red color for logout
  },
  logoutIcon: {
    color: '#d9534f', // Red color for logout icon
  },
  hamburgerContainer: {
    position: 'absolute',
    left: -20, // Move icon outside the sidebar by 25px
    top: 15, // Keep it at the top of the sidebar
    zIndex: 999, // Make sure it's above other elements
  },
  hamburgerBackground: {
    backgroundColor: '#fff', // White square background
    width: 40, // Square size
    height: 40, // Square size
    borderRadius: 8, // Rounded corners for the square
    justifyContent: 'center', // Center the icon inside the square
    alignItems: 'center', // Center the icon inside the square
    elevation: 5, // Android shadow
  },
  hamburgerIcon: {
    color: '#02c3cc', // Dark blue color for hamburger icon
  },
});

export default Sidebar;
