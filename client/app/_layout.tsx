import { View } from 'react-native';
import { useSegments } from 'expo-router';
import Footer from './layouts/footer';
import Header from './layouts/header';
import { Slot } from 'expo-router';

const RootLayout = () => {
  const segments = useSegments();
  const isHiddenPage = ['login', 'index'].includes(segments?.[0] ?? '');

  return (
    <View style={{ flex: 1 }}>
      {!isHiddenPage && <Header />}
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
      {!isHiddenPage && <Footer />}
    </View>
  );
};

export default RootLayout;