import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const TaxCalculator = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: "https://payetax.netlify.app/#google_vignette" }}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default TaxCalculator;
