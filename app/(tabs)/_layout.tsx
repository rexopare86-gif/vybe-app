import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const TAB_BAR_HEIGHT = 72;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,

        // ✅ This is the key fix for WEB: keep tab bar above everything
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: TAB_BAR_HEIGHT,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 30,
          zIndex: 9999,
          backgroundColor: "#0B0F1A",
        },
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#94A3B8",
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "For You",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play" size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="following"
        options={{
          title: "Following",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size ?? 26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size ?? 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
