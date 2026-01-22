// lib/comments.ts
import { supabase } from "./supabase";

export type CommentRow = {
  id: string;
  video_id: string;
  user_id: string;
  text: string;
  created_at: string;
  profiles?: { username: string | null } | null;
};

export async function getCommentCount(videoId: string): Promise<number> {
  const { count, error } = await supabase
    .from("video_comments")
    .select("*", { head: true, count: "exact" })
    .eq("video_id", videoId);

  if (error) throw error;
  return count ?? 0;
}

export async function listComments(videoId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("video_comments")
    .select(
      `
        id,
        video_id,
        user_id,
        text,
        created_at,
        profiles:profiles!video_comments_user_id_fkey ( username )
      `
    )
    .eq("video_id", videoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CommentRow[];
}

export async function addComment(videoId: string, raw: string) {
  const text = raw.trim();
  if (!text) throw new Error("Comment cannot be empty");
  if (text.length > 500) throw new Error("Max 500 characters");

  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("video_comments").insert({
    video_id: videoId,
    user_id: user.id,
    text,
  });

  if (error) throw error;
}
