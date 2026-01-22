// lib/follows.ts
import { supabase } from "./supabase";

export async function followUser(targetUserId: string) {
  const { data } = await supabase.auth.getUser();
  const me = data.user;
  if (!me) throw new Error("Not signed in");
  if (me.id === targetUserId) throw new Error("You can’t follow yourself.");

  const { error } = await supabase.from("follows").insert({
    follower_id: me.id,
    following_id: targetUserId,
  });

  // ignore duplicates (unique constraint) if you added one in DB
  if (error && error.code !== "23505") throw error;
}

export async function unfollowUser(targetUserId: string) {
  const { data } = await supabase.auth.getUser();
  const me = data.user;
  if (!me) throw new Error("Not signed in");

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", me.id)
    .eq("following_id", targetUserId);

  if (error) throw error;
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  const me = data.user;
  if (!me) return false;

  const { data: rows, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", me.id)
    .eq("following_id", targetUserId)
    .limit(1);

  if (error) throw error;
  return !!rows && rows.length > 0;
}

export async function getFollowCounts(userId: string): Promise<{
  followers: number;
  following: number;
}> {
  const [{ count: followers, error: err1 }, { count: following, error: err2 }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { head: true, count: "exact" })
        .eq("following_id", userId),
      supabase
        .from("follows")
        .select("*", { head: true, count: "exact" })
        .eq("follower_id", userId),
    ]);

  if (err1) throw err1;
  if (err2) throw err2;

  return {
    followers: followers ?? 0,
    following: following ?? 0,
  };
}
