// app/(tabs)/search.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SearchTab() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.sub}>Coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#070A12", padding: 20, paddingTop: 40 },
  title: { color: "white", fontSize: 24, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.6)", marginTop: 8 },
});
