import { VybeTabBar } from "@/components/ui/VybeTabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <VybeTabBar {...props} />}
    >
      {/* HOME / FEED */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Feed",
        }}
      />

      {/* DISCOVER / EXPLORE */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
        }}
      />

      {/* CREATE / UPLOAD */}
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
        }}
      />

      {/* NOTIFICATIONS */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
