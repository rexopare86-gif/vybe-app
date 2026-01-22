import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CommentsModal from "./CommentsModal";
import TipPickerModal from "./TipPickerModal";

type VideoPost = {
  id: string;
  media_url?: string | null;
  caption?: string | null;
  like_count?: number | null;
  comment_count?: number | null;
  creator_id?: string | null;
};

export default function VideoPlayer({ post }: { post?: VideoPost }) {
  // ✅ SAFETY: never allow undefined access
  if (!post || !post.media_url) {
    return null;
  }

  const [showComments, setShowComments] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const likeCount = post.like_count ?? 0;
  const commentCount = post.comment_count ?? 0;
  const caption = post.caption ?? "";

  return (
    <View style={styles.container}>
      {/* VIDEO */}
      <Video
        source={{ uri: post.media_url }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        useNativeControls={false}
      />

      {/* RIGHT ACTION BAR */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart" size={28} color="white" />
          <Text style={styles.count}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowComments(true)}
        >
          <Ionicons name="chatbubble" size={26} color="white" />
          <Text style={styles.count}>{commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowTips(true)}
        >
          <Ionicons name="gift" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* CAPTION */}
      {caption.length > 0 && (
        <View style={styles.caption}>
          <Text style={styles.captionText}>{caption}</Text>
        </View>
      )}

      {/* MODALS */}
      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
      />

      <TipPickerModal
        visible={showTips}
        onClose={() => setShowTips(false)}
        creatorId={post.creator_id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "black",
  },
  video: {
    height: "100%",
    width: "100%",
  },
  actions: {
    position: "absolute",
    right: 12,
    bottom: 120,
    alignItems: "center",
  },
  actionButton: {
    marginBottom: 18,
    alignItems: "center",
  },
  count: {
    color: "white",
    fontSize: 12,
    marginTop: 4,
  },
  caption: {
    position: "absolute",
    bottom: 40,
    left: 12,
    right: 80,
  },
  captionText: {
    color: "white",
    fontSize: 14,
  },
});
