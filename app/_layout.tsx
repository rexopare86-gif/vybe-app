// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth group */}
      <Stack.Screen name="(auth)" />

      {/* Tabs group */}
      <Stack.Screen name="(tabs)" />

      {/* Optional screens outside tabs */}
      <Stack.Screen name="profile-feed" />
      <Stack.Screen name="modal" />
      <Stack.Screen name="creator/[id]/feed" />
    </Stack>
  );
}
