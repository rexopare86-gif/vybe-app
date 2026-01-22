import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import VideoPlayer from "../VideoPlayer";

// If your file is at app/lib/feed.ts instead, change to: ../../lib/feed
import { getFollowingFeed, getForYouFeed, type FeedItem } from "../../../lib/feed";

type FeedMode = "foryou" | "following";

const TAB_BAR_HEIGHT = 72; // used for spacing only

export default function Feed({ mode }: { mode: FeedMode }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80,
      minimumViewTime: 150,
    }),
    []
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
      const first = viewableItems?.[0]?.index;
      if (typeof first === "number") setActiveIndex(first);
    }
  ).current;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`Loading ${mode.toUpperCase()} feed...`);
      const data = mode === "following" ? await getFollowingFeed() : await getForYouFeed();
      console.log(`${mode} rows:`, data?.length ?? 0);
      setItems(Array.isArray(data) ? data : []);
      setActiveIndex(0);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => {
      const paused = index !== activeIndex;

      return (
        <View style={styles.page}>
          <View style={styles.videoWrap}>
            <VideoPlayer uri={item.videoUrl} poster={item.posterUrl} paused={paused} muted={false} />
          </View>

          {/* Right-side actions */}
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={() => console.log("Like", item.id)}>
              <Text style={styles.actionText}>Like</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => console.log("Comment", item.id)}>
              <Text style={styles.actionText}>Comment</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => console.log("Share", item.id)}>
              <Text style={styles.actionText}>Share</Text>
            </Pressable>
          </View>

          {/* Caption */}
          <View style={styles.caption}>
            <Text style={styles.captionTitle} numberOfLines={1}>
              {item.title ?? "Untitled"}
            </Text>
            <Text style={styles.captionBody} numberOfLines={2}>
              {item.caption ?? ""}
            </Text>
          </View>
        </View>
      );
    },
    [activeIndex]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Top mode toggle */}
      <View style={styles.topBar}>
        <Text style={[styles.topChip, mode === "foryou" && styles.topChipActive]}>For You</Text>
        <Text style={[styles.topChip, mode === "following" && styles.topChipActive]}>Following</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT,
        }}
      />

      {/* IMPORTANT: custom bottom bar ONLY on WEB */}
      {Platform.OS === "web" ? (
        <View style={styles.webBottomBar} pointerEvents="auto">
          <Text style={styles.webBottomText}>Tip</Text>
          <Text style={styles.webBottomText}>Reply</Text>
          <Text style={styles.webBottomText}>Vibe</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "black" },

  topBar: {
    position: "absolute",
    top: 14,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  topChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "white",
    fontSize: 12,
  },
  topChipActive: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  page: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    backgroundColor: "black",
  },
  videoWrap: {
    ...StyleSheet.absoluteFillObject,
  },

  actions: {
    position: "absolute",
    right: 12,
    bottom: 140,
    gap: 10,
    zIndex: 9,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  actionText: { color: "white", fontSize: 12 },

  caption: {
    position: "absolute",
    left: 12,
    right: 100,
    bottom: 110,
    zIndex: 9,
  },
  captionTitle: { color: "white", fontWeight: "700", marginBottom: 6 },
  captionBody: { color: "rgba(255,255,255,0.85)" },

  webBottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: "rgba(0,0,0,0.65)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  webBottomText: { color: "white", opacity: 0.9 },
});
