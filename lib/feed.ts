import { supabase } from "./supabase";

export type FeedItem = {
  id: string;
  user_id: string;
  caption: string | null;
  media_url: string;
  media_type: "video" | "image" | string;
  created_at?: string;
};

export async function getForYouFeed(): Promise<FeedItem[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,caption,media_url,media_type,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  // Filter out any bad rows just in case
  return (data ?? []).filter((p: any) => !!p.media_url) as FeedItem[];
}

export async function getFollowingFeed(): Promise<FeedItem[]> {
  // If you don’t have following logic yet, return same as ForYou for now
  return getForYouFeed();
}
