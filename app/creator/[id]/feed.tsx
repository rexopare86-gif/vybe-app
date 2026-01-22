// app/creator/[id]/feed.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";

import { supabase } from "../../../lib/supabase";
import VideoPlayer from "../../components/VideoPlayer";

const { height } = Dimensions.get("window");

type Row = {
  id: string;
  user_id: string;
  video_url: string;
  caption: string | null;
  profiles?: { username: string | null } | null;
};

export default function CreatorFeedScreen() {
  const params = useLocalSearchParams<{ id: string; start?: string }>();
  const creatorId = params.id as string;
  const startVideoId = params.start as string | undefined;

  const [videos, setVideos] = useState<Row[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const first = viewableItems?.[0]?.index;
      if (typeof first === "number") setCurrentIndex(first);
    }
  ).current;

  useEffect(() => {
    (async () => {
      if (!creatorId) return;

      const { data, error } = await supabase
        .from("videos")
        .select(
          `
          id,
          user_id,
          video_url,
          caption,
          profiles:profiles!videos_user_id_fkey ( username )
        `
        )
        .eq("user_id", creatorId)
        .order("created_at", { ascending: false })
        .limit(60);

      if (error) {
        console.log("creator feed error", error);
        setVideos([]);
        return;
      }

      const rows = (data ?? []) as Row[];
      setVideos(rows);

      // start at tapped video if provided
      if (startVideoId) {
        const idx = rows.findIndex((v) => v.id === startVideoId);
        if (idx >= 0) setCurrentIndex(idx);
      }
    })();
  }, [creatorId, startVideoId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <VideoPlayer
            videoId={item.id}
            uri={item.video_url}
            username={item.profiles?.username ?? "creator"}
            caption={item.caption ?? ""}
            isActive={index === currentIndex}
          />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        windowSize={3}
        maxToRenderPerBatch={3}
        initialNumToRender={1}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        initialScrollIndex={currentIndex}
        onScrollToIndexFailed={() => {
          // RN will recover after layout
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
});
