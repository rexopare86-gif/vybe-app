// lib/compressVideo.ts
import { Video } from "react-native-compressor";

/**
 * Compress a video file and return the new URI.
 */
export async function compressVideo(inputUri: string): Promise<string> {
  try {
    const compressedUri = await Video.compress(
      inputUri,
      {
        compressionMethod: "auto",   // let library choose best method
        maxSize: 1280,               // max width/height
        quality: "medium",           // "low" | "medium" | "high"
        bitrate: 800_000,            // ~0.8 Mbps, tweak if you want
      },
      (progress) => {
        // 0 → 1
        console.log("📉 Video compression:", progress);
      }
    );

    console.log("✅ Compressed video:", compressedUri);
    return compressedUri;
  } catch (e) {
    console.log("❌ Compression failed, using original", e);
    // fall back to original if compression fails
    return inputUri;
  }
}
