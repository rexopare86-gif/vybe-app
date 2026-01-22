import { supabase } from "./supabase";

export async function getLikeStateForVideos(videoIds: string[]) {
  if (!videoIds.length) return { likedSet: new Set<string>(), counts: new Map<string, number>() };

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) return { likedSet: new Set<string>(), counts: new Map<string, number>() };

  // Fetch ALL likes for these videos (simple MVP approach)
  const { data, error } = await supabase
    .from("video_likes")
    .select("video_id,user_id")
    .in("video_id", videoIds);

  if (error) throw error;

  const counts = new Map<string, number>();
  const likedSet = new Set<string>();

  for (const row of data ?? []) {
    counts.set(row.video_id, (counts.get(row.video_id) ?? 0) + 1);
    if (row.user_id === userId) likedSet.add(row.video_id);
  }

  // Ensure every video has a count entry
  for (const vid of videoIds) {
    if (!counts.has(vid)) counts.set(vid, 0);
  }

  return { likedSet, counts };
}

export async function toggleLike(videoId: string, currentlyLiked: boolean) {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error("Not signed in");

  if (currentlyLiked) {
    const { error } = await supabase
      .from("video_likes")
      .delete()
      .eq("video_id", videoId)
      .eq("user_id", userId);

    if (error) throw error;
    return { liked: false };
  } else {
    const { error } = await supabase
      .from("video_likes")
      .insert({ video_id: videoId, user_id: userId });

    if (error) throw error;
    return { liked: true };
  }
}
