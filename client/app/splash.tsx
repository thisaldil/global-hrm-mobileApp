import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";

const SplashScreen = () => {
  const navigation = useNavigation();
  const [isVideoFinished, setIsVideoFinished] = useState(false);

  useEffect(() => {
    if (isVideoFinished) {
      navigation.replace("Home"); // Redirect to Home Screen after video
    }
  }, [isVideoFinished]);

  return (
    <View style={styles.container}>
      <Video
        source={require("../assets/videos/splash.mp4")} // Place your video inside assets/videos/
        style={styles.video}
        resizeMode="cover"
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.didJustFinish) {
            setIsVideoFinished(true);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Background color while loading
  },
  video: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
