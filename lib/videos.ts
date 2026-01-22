// lib/videos.ts

import { supabase } from "./supabase";

export type FeedVideoRow = {
  id: string;
  file_url: string;
  caption: string | null;
  media_type: string | null;
  created_at: string;
  user_id: string;
  // We'll add profile data later – leave this optional for now
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
};

/**
 * "For You" feed – returns the latest videos from the videos table.
 */
export async function getForYouFeed(): Promise<FeedVideoRow[]> {
  const { data, error } = await supabase
    .from("videos") // this should be your public.videos table
    .select("id, file_url, caption, media_type, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getForYouFeed error:", error.message);
    throw error;
  }

  console.log("getForYouFeed rows:", data?.length ?? 0);
  return (data ?? []) as FeedVideoRow[];
}

/**
 * "Following" feed – for now just reuse For You.
 * We’ll later filter by people you follow.
 */
export async function getFollowingFeed(): Promise<FeedVideoRow[]> {
  const result = await getForYouFeed();
  console.log("getFollowingFeed rows:", result.length);
  return result;
}
