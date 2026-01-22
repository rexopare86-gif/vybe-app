import { radius, shadows } from "@/lib/theme";
import { useTheme } from "@/lib/theme-provider/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_HEIGHT = 64;

export function VybeTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <View style={styles.outer}>
        <BlurView intensity={28} tint="dark" style={[styles.blur, { borderColor: c.border }]}>
          {/* Glow line */}
          <View
            style={[
              styles.glowLine,
              {
                backgroundColor: c.brandA,
                shadowColor: c.brandA,
              },
            ]}
          />

          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = async () => {
                await Haptics.selectionAsync();
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.emit({ type: "tabLongPress", target: route.key });
              };

              const iconName = getIcon(route.name, isFocused);

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={({ pressed }) => [
                    styles.item,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  {/* Active orb */}
                  {isFocused ? (
                    <View style={styles.activeWrap} pointerEvents="none">
                      <View
                        style={[
                          styles.activeOrb,
                          {
                            backgroundColor: c.brandA,
                            shadowColor: c.brandA,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.activeOrb2,
                          {
                            backgroundColor: c.brandB,
                            shadowColor: c.brandB,
                          },
                        ]}
                      />
                    </View>
                  ) : null}

                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={isFocused ? c.text : c.textFaint}
                  />

                  {/* Tiny dot indicator */}
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isFocused ? c.brandB : "transparent",
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </BlurView>

        {/* Soft shadow behind */}
        <View style={[styles.shadow, { backgroundColor: "transparent" }]} />
      </View>
    </View>
  );
}

function getIcon(routeName: string, focused: boolean) {
  // Match your tab route names.
  // From your screenshots you likely have: feed, explore, upload, profile, notifications
  const name = routeName.toLowerCase();

  if (name.includes("feed") || name.includes("index") || name.includes("foryou")) {
    return focused ? "play" : "play-outline";
  }
  if (name.includes("explore") || name.includes("discover")) {
    return focused ? "compass" : "compass-outline";
  }
  if (name.includes("upload") || name.includes("create") || name.includes("plus")) {
    return focused ? "add-circle" : "add-circle-outline";
  }
  if (name.includes("notif")) {
    return focused ? "notifications" : "notifications-outline";
  }
  if (name.includes("profile") || name.includes("me")) {
    return focused ? "person" : "person-outline";
  }

  // fallback
  return focused ? "ellipse" : "ellipse-outline";
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  outer: {
    width: "92%",
  },
  blur: {
    height: TAB_HEIGHT,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: "hidden",
    ...shadows.soft,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
  },
  item: {
    width: 64,
    height: TAB_HEIGHT - 10,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginTop: 5,
  },
  glowLine: {
    position: "absolute",
    top: -8,
    left: "20%",
    right: "20%",
    height: 3,
    borderRadius: 999,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  activeWrap: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  activeOrb: {
    position: "absolute",
    width: 34,
    height: 34,
    borderRadius: 999,
    opacity: 0.18,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  activeOrb2: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 999,
    opacity: 0.16,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
  },
  shadow: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 0,
    height: TAB_HEIGHT,
    borderRadius: radius.pill,
  },
});
