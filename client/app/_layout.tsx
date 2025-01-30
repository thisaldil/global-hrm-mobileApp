import { View } from 'react-native';
import { useSegments } from 'expo-router';
import Footer from './layouts/footer';
import Header from './layouts/header';
import { Slot } from 'expo-router';

const RootLayout = () => {
  const segments = useSegments(); // Get the current route segments
  const isLoginPage = segments?.[0] === 'login'; // Check if the first segment is "login"

  return (
    <View style={{ flex: 1 }}>
      {/* Conditionally render the Header */}
      {!isLoginPage && <Header />}

      {/* Render the child route */}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Conditionally render the Footer */}
      {!isLoginPage && <Footer />}
    </View>
  );
};

export default RootLayout;
