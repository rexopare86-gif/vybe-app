// app/profile-feed.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { FeedItem, getMyVibes } from "../lib/feed";
import { supabase } from "../lib/supabase";
import VideoPlayer from "./components/VideoPlayer";

export default function ProfileFeedScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) {
          setItems([]);
          return;
        }

        const rows = await getMyVibes(user.id);
        setItems(rows);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.sub}>Loading your vibes...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(it) => it.id}
      contentContainerStyle={{ padding: 16, paddingTop: 24 }}
      ListHeaderComponent={
        <View style={{ marginBottom: 14 }}>
          <Text style={styles.title}>My Vibes</Text>
          <Text style={styles.sub}>Your uploads in one place.</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.sub}>No uploads yet.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.caption || "Untitled"}</Text>
          {item.media_type === "video" ? (
            <VideoPlayer uri={item.file_url} />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.sub}>Image support coming next.</Text>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: "#070A12", alignItems: "center", justifyContent: "center", padding: 20 },
  title: { color: "white", fontSize: 24, fontWeight: "800" },
  sub: { color: "rgba(255,255,255,0.6)", marginTop: 8 },
  card: { marginBottom: 18 },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "800", marginBottom: 10 },
  imageFallback: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});
