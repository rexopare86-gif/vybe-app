import { ThemeProvider } from "@/lib/theme-provider/ThemeProvider";
import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
