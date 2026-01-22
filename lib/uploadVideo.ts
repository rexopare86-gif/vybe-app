// lib/uploadVideo.ts
import * as ImagePicker from "expo-image-picker";
import { compressVideo } from "./compressVideo";
import { supabase } from "./supabase";

export async function pickAndUploadVideo(caption: string) {
  // 1) Pick a video
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    quality: 1, // keep original here, we'll compress ourselves
  });

  if (picked.canceled) {
    throw new Error("Canceled");
  }

  const asset = picked.assets[0];
  let uri = asset.uri;

  // 2) Compress
  uri = await compressVideo(uri);

  // 3) Build storage path
  const fileName = `videos/${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}.mp4`;

  // 4) Stream file as blob (no giant memory allocation)
  const fileRes = await fetch(uri);
  const blob = await fileRes.blob();

  const { data: storageData, error: storageErr } = await supabase.storage
    .from("videos")
    .upload(fileName, blob, {
      cacheControl: "3600",
      upsert: false,
      contentType: "video/mp4",
    });

  if (storageErr) {
    console.log("Supabase storage error", storageErr);
    throw storageErr;
  }

  // 5) Get public URL
  const { data: pub } = supabase.storage.from("videos").getPublicUrl(fileName);
  const publicUrl = pub.publicUrl;

  // 6) Insert DB row
  const { error: dbErr } = await supabase.from("videos").insert({
    video_url: publicUrl,
    caption,
  });

  if (dbErr) {
    console.log("DB insert error", dbErr);
    throw dbErr;
  }

  return publicUrl;
}
