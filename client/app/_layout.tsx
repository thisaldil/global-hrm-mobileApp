//_layouts.tsx
//E:\global-hrm-mobile\client\app\_layout.tsx

import { View } from 'react-native';
import Footer from './layouts/footer'; 
import Header from './layouts/header'; // Correct relative path
// Correct relative path
import { Slot } from 'expo-router';

const RootLayout = () => {
  return (
    <View style={{ flex: 1 }}>
    {/* Render the Header */}
    <Header/>

      {/* Render the child route */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Render the Footer */}
      <Footer />
    </View>
  );
};

export default RootLayout;