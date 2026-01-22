// app/creator/[id]/index.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { followUser, getFollowCounts, isFollowing, unfollowUser } from "../../../lib/follows";
import { supabase } from "../../../lib/supabase";
import TipPickerModal from "../../components/TipPickerModal";

type ProfileRow = {
  id: string;
  username: string | null;
  is_creator: boolean | null;
};

export default function CreatorProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const creatorId = String(params.id ?? "");

  const [loading, setLoading] = useState(true);

  const [meId, setMeId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowingCount] = useState(0);

  const [amFollowing, setAmFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  // Tip modal
  const [tipOpen, setTipOpen] = useState(false);
  const [tipping, setTipping] = useState(false);

  const canFollow = useMemo(
    () => !!meId && !!creatorId && creatorId !== meId,
    [meId, creatorId]
  );
  const canTip = canFollow;

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);

        // who am I?
        const { data: u } = await supabase.auth.getUser();
        const user = u.user;
        if (!alive) return;

        setMeId(user?.id ?? null);

        if (!creatorId) {
          setProfile(null);
          setFollowers(0);
          setFollowingCount(0);
          setAmFollowing(false);
          return;
        }

        // profile
        const { data: p, error: pErr } = await supabase
          .from("profiles")
          .select("id, username, is_creator")
          .eq("id", creatorId)
          .single();

        if (pErr) throw pErr;
        if (!alive) return;

        setProfile(p as ProfileRow);

        // counts (for the creator)
        const counts = await getFollowCounts(creatorId);
        if (!alive) return;

        setFollowers(counts.followers);
        setFollowingCount(counts.following);

        // am I following?
        if (user?.id && creatorId !== user.id) {
          const f = await isFollowing(creatorId);
          if (!alive) return;
          setAmFollowing(f);
        } else {
          setAmFollowing(false);
        }
      } catch (e: any) {
        console.log("Creator profile load error:", e?.message ?? e);
        if (!alive) return;
        setProfile(null);
        setFollowers(0);
        setFollowingCount(0);
        setAmFollowing(false);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [creatorId]);

  async function toggleFollow() {
    if (!creatorId) return;
    if (!meId) {
      alert("Please sign in first.");
      return;
    }
    if (creatorId === meId) {
      alert("You can’t follow yourself.");
      return;
    }
    if (busy) return;

    try {
      setBusy(true);

      if (amFollowing) {
        setAmFollowing(false);
        setFollowers((v) => Math.max(0, v - 1));
        await unfollowUser(creatorId);
      } else {
        setAmFollowing(true);
        setFollowers((v) => v + 1);
        await followUser(creatorId);
      }

      const counts = await getFollowCounts(creatorId);
      setFollowers(counts.followers);
      setFollowingCount(counts.following);
    } catch (e: any) {
      alert(e?.message ?? "Follow failed");
      try {
        const f = await isFollowing(creatorId);
        setAmFollowing(f);
        const counts = await getFollowCounts(creatorId);
        setFollowers(counts.followers);
        setFollowingCount(counts.following);
      } catch {
        // ignore
      }
    } finally {
      setBusy(false);
    }
  }

  function openCreatorFeed() {
    router.push(`/creator/${creatorId}/feed`);
  }

  async function sendProfileTip(amount: 1 | 5 | 10 | 20 | 50) {
    if (!creatorId) return;
    if (!meId) {
      alert("Please sign in first.");
      return;
    }
    if (creatorId === meId) {
      alert("You can’t tip yourself.");
      return;
    }
    if (tipping) return;

    try {
      setTipping(true);
      setTipOpen(false);

      // Profile-level tip (not tied to a single video)
      const { error } = await supabase.from("video_tips").insert({
        from_user_id: meId,
        to_user_id: creatorId,
        video_id: null,
        amount,
      });

      if (error) throw error;

      alert(`Sent ${amount} coins ✅`);
    } catch (e: any) {
      setTipOpen(true);
      alert(e?.message ?? "Tip failed");
    } finally {
      setTipping(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading creator…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Creator not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const username = profile.username ?? "creator";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>←</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>@{username}</Text>
          <Text style={styles.headerSub}>Creator profile</Text>
        </View>

        <Pressable
          onPress={toggleFollow}
          style={[styles.followBtn, !canFollow && { opacity: 0.5 }]}
          disabled={!canFollow || busy}
        >
          <Text style={styles.followText}>{amFollowing ? "Following" : "Follow"}</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <Pressable style={styles.primary} onPress={openCreatorFeed}>
          <Text style={styles.primaryText}>View videos</Text>
        </Pressable>

        <Pressable
          style={[styles.tipBtn, !canTip && { opacity: 0.5 }]}
          onPress={() => setTipOpen(true)}
          disabled={!canTip}
        >
          <Text style={styles.tipText}>🪙 Tip this creator</Text>
        </Pressable>

        {!canTip ? (
          <Text style={styles.note}>
            {meId ? "You can’t tip yourself." : "Sign in to tip creators."}
          </Text>
        ) : null}
      </View>

      <TipPickerModal
        visible={tipOpen}
        busy={tipping}
        onClose={() => setTipOpen(false)}
        onConfirm={sendProfileTip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 18, fontWeight: "800" },
  muted: { color: "#888", marginTop: 10 },

  header: {
    paddingTop: 44,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#141414",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerBtnText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "900" },
  headerSub: { color: "#aaa", marginTop: 2, fontSize: 12 },

  followBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  followText: { color: "#fff", fontWeight: "900" },

  body: { padding: 18 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1b1b1b",
  },
  statNum: { color: "#fff", fontSize: 26, fontWeight: "900" },
  statLabel: { color: "#aaa", marginTop: 6 },

  primary: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  primaryText: { color: "#fff", fontWeight: "900" },

  tipBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1b1b1b",
  },
  tipText: { color: "#fff", fontWeight: "900" },

  note: { color: "#777", marginTop: 10, lineHeight: 18 },

  backBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#222",
  },
  backText: { color: "#fff", fontWeight: "900" },
});
