// app/feed.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getFollowingFeed, getForYouFeed } from "../lib/videos";
import VideoPlayer from "./components/VideoPlayer";

type Mode = "foryou" | "following";

type Props = {
  title?: string;
  subtitle?: string;
  mode: Mode;
};

type VideoItem = {
  id: string;
  file_url: string;
  caption: string | null;
  media_type: "image" | "video" | string | null;
};

export default function Feed({ title, subtitle, mode }: Props) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        console.log(
          mode === "foryou"
            ? "Loading FOR YOU feed..."
            : "Loading FOLLOWING feed..."
        );

        const data =
          mode === "foryou" ? await getForYouFeed() : await getFollowingFeed();

        console.log(
          mode === "foryou" ? "getForYouFeed rows:" : "getFollowingFeed rows:",
          data?.length ?? 0
        );

        setVideos((data as VideoItem[]) ?? []);
      } catch (e) {
        console.error("Feed error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [mode]);

  const headerTitle =
    title ?? (mode === "foryou" ? "Today's Vibes" : "Creators you vibe with");

  const headerSubtitle =
    subtitle ??
    (mode === "foryou"
      ? "Fresh content from across VibeLink."
      : "Content from people you follow.");

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{headerTitle}</Text>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>
      </View>

      {/* Loading / Empty / Feed */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No content yet. Upload a vibe to get started!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.feedContent}>
          {videos.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.mediaContainer}>
                {item.media_type === "image" ? (
                  <Image
                    source={{ uri: item.file_url }}
                    style={styles.media}
                    resizeMode="cover"
                  />
                ) : (
                  <VideoPlayer fileUrl={item.file_url} mediaType="video" />
                )}
              </View>

              <Text style={styles.caption}>
                {item.caption && item.caption.trim().length > 0
                  ? item.caption
                  : "Untitled"}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  feedContent: {
    paddingBottom: 80,
  },
  card: {
    marginBottom: 24,
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 9 / 16, // tall like TikTok
    backgroundColor: "#000",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  caption: {
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
