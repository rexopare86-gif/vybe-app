import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * Lock the bar height so screens can reserve space for it.
 * Use this in screens: paddingBottom: TAB_BAR_TOTAL_HEIGHT
 */
export const TAB_BAR_HEIGHT = 62;
export const TAB_BAR_BOTTOM_PADDING = Platform.OS === "ios" ? 20 : 10;
export const TAB_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_PADDING;

type TabKey =
  | "foryou"
  | "following"
  | "search"
  | "upload"
  | "profile"
  | "explore"
  | "notifications";

type Tab = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const TABS: Tab[] = [
  { key: "foryou", label: "For You", icon: "play-circle-outline", route: "/feed" },
  { key: "following", label: "Following", icon: "people-outline", route: "/following" },
  { key: "search", label: "Search", icon: "search-outline", route: "/search" },
  { key: "upload", label: "Upload", icon: "add-circle-outline", route: "/upload" },
  { key: "profile", label: "Profile", icon: "person-outline", route: "/profile" },
  { key: "explore", label: "Explore", icon: "compass-outline", route: "/explore" },
  { key: "notifications", label: "Alerts", icon: "notifications-outline", route: "/notifications" },
];

type Props = {
  /**
   * Optional badge counts (safe defaults, won’t break anything)
   * Example: { notifications: 2 }
   */
  badges?: Partial<Record<TabKey, number>>;
};

function AnimatedTab({
  label,
  icon,
  active,
  onPress,
  badgeCount,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  badgeCount?: number;
}) {
  const scale = useRef(new Animated.Value(active ? 1.06 : 1)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: active ? 1.06 : 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : 0.85,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [active, opacity, scale]);

  const iconColor = active ? "#7C7CFF" : "#9CA3AF";
  const labelColor = active ? "#7C7CFF" : "#9CA3AF";

  return (
    <TouchableOpacity style={styles.tab} activeOpacity={0.75} onPress={onPress}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={iconColor} />

          {!!badgeCount && badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? "99+" : String(badgeCount)}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function BottomTabs({ badges }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const badgeMap = useMemo(() => badges ?? {}, [badges]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <LinearGradient
        colors={["rgba(20,24,45,0.95)", "rgba(10,12,20,0.98)"]}
        style={styles.bar}
      >
        {TABS.map(tab => {
          const active = pathname === tab.route;

          return (
            <AnimatedTab
              key={tab.key}
              label={tab.label}
              icon={tab.icon}
              active={active}
              badgeCount={badgeMap[tab.key]}
              onPress={() => router.push(tab.route)}
            />
          );
        })}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    paddingHorizontal: 8,
    paddingBottom: TAB_BAR_BOTTOM_PADDING,

    // Click/touch reliability (Android + Web)
    zIndex: 9999,
    elevation: 30,
  },

  bar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    zIndex: 9999,
    elevation: 30,
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    width: 52,
  },

  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "600",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -14,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
