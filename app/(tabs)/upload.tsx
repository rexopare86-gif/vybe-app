import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase"; // <-- adjust if your supabase client path differs

export default function UploadScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const canUpload = useMemo(() => !!videoUri && !uploading, [videoUri, uploading]);

  const pickVideo = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow access to your media library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType, // Expo SDK now prefers this
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Pick failed", "No video selected.");
        return;
      }

      setVideoUri(asset.uri);
    } catch (e: any) {
      Alert.alert("Pick error", e?.message ?? "Failed to pick video");
    }
  };

  const uploadVideo = async () => {
    if (!videoUri) {
      Alert.alert("No video", "Please choose a video first.");
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      Alert.alert("Not signed in", "Please sign in again.");
      return;
    }

    setUploading(true);

    try {
      // 1) Turn local file into blob
      const res = await fetch(videoUri);
      const blob = await res.blob();

      // 2) Upload to Storage
      const fileExt = "mp4";
      const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${fileExt}`;
      const storagePath = `public/${user.id}/${fileName}`;

      const { error: upErr } = await supabase.storage
        .from("posts")
        .upload(storagePath, blob, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (upErr) throw upErr;

      // 3) Get PUBLIC URL (works if bucket is Public)
      const { data: pub } = supabase.storage.from("posts").getPublicUrl(storagePath);
      const mediaUrl = pub?.publicUrl;

      if (!mediaUrl) {
        throw new Error("Could not create public URL. Make sure Storage bucket 'posts' is PUBLIC.");
      }

      // 4) Insert post row (THIS fixes: media_url NOT NULL)
      const { error: insErr } = await supabase.from("posts").insert({
        user_id: user.id,
        caption: caption?.trim() || null,
        media_url: mediaUrl,
        media_type: "video",
      });

      if (insErr) throw insErr;

      Alert.alert("Uploaded", "Your video is now on your feed.");
      setCaption("");
      setVideoUri(null);
    } catch (e: any) {
      console.log("UPLOAD_ERROR", e);
      Alert.alert("Upload failed", e?.message ?? "Unknown error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload</Text>
      <Text style={styles.sub}>Pick a video, add a caption, upload to your feed.</Text>

      <TouchableOpacity style={styles.btn} onPress={pickVideo} disabled={uploading}>
        <Text style={styles.btnText}>{videoUri ? "Change video" : "Pick a video"}</Text>
      </TouchableOpacity>

      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="Write a caption (optional)"
        placeholderTextColor="#777"
        style={styles.input}
        editable={!uploading}
      />

      <TouchableOpacity style={[styles.btn, !canUpload && styles.btnDisabled]} onPress={uploadVideo} disabled={!canUpload}>
        {uploading ? <ActivityIndicator /> : <Text style={styles.btnText}>Upload</Text>}
      </TouchableOpacity>

      <Text style={styles.tip}>Tip: After upload, refresh For You – it should appear immediately.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 6 },
  sub: { color: "#9aa0a6", marginBottom: 18 },
  btn: {
    backgroundColor: "#5b2cff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontWeight: "700" },
  input: {
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  tip: { color: "#9aa0a6", marginTop: 6 },
});
