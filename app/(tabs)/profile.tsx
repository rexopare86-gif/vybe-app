// app/(tabs)/profile.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { supabase } from "../../lib/supabase";
import { getOrCreateWallet } from "../../lib/wallet";

type Stats = {
  vibes: number;
  likes: number;
  comments: number;
};

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const [stats, setStats] = useState<Stats>({ vibes: 0, likes: 0, comments: 0 });
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const formattedBalance = useMemo(() => {
    // Simple formatting, avoids any "currency" column requirement
    return `£${walletBalance.toFixed(2)}`;
  }, [walletBalance]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // 1) Auth user
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();

        if (authErr) throw authErr;
        if (!user) {
          router.replace("/(auth)/sign-in");
          return;
        }

        setUserId(user.id);
        setEmail(user.email ?? "");

        // 2) Stats (safe queries: if table missing, you’ll see it in console)
        // vibes count
        const { count: vibesCount } = await supabase
          .from("feed")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        // likes received by this user's posts
        const { data: myPostIds } = await supabase
          .from("feed")
          .select("id")
          .eq("user_id", user.id);

        const ids = (myPostIds ?? []).map((r: any) => r.id).filter(Boolean);

        let likesCount = 0;
        if (ids.length > 0) {
          const { count } = await supabase
            .from("likes")
            .select("id", { count: "exact", head: true })
            .in("post_id", ids);
          likesCount = count ?? 0;
        }

        // comments written by this user
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        setStats({
          vibes: vibesCount ?? 0,
          likes: likesCount ?? 0,
          comments: commentsCount ?? 0,
        });

        // 3) Wallet (THIS is where your PGRST204 was happening before)
        // Now wallet.ts DOES NOT request wallets.currency, so it won’t crash.
        const wallet = await getOrCreateWallet(user.id);
        setWalletBalance(Number(wallet.balance ?? 0));
      } catch (err: any) {
        console.error("Error loading profile data:", err);
        // keep UI usable, but show toast/alert
        Alert.alert("Profile", err?.message ?? "Error loading profile data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.replace("/(auth)/sign-in");
    } catch (err: any) {
      console.error("Sign out error:", err);
      Alert.alert("Error", err?.message ?? "Failed to sign out");
    }
  }

  function comingSoon(msg: string) {
    Alert.alert("Alert", msg);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Vibes</Text>
      <Text style={styles.subTitle}>{email || "—"}</Text>

      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Creator</Text>
          </View>
          <View style={[styles.badge, styles.badgeOutline]}>
            <Text style={[styles.badgeText, styles.badgeOutlineText]}>
              Open for collabs
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.vibes}</Text>
          <Text style={styles.statLabel}>Vibe</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.likes}</Text>
          <Text style={styles.statLabel}>Like</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.comments}</Text>
          <Text style={styles.statLabel}>Comments</Text>
        </View>
      </View>

      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Wallet balance</Text>
        <Text style={styles.walletBalance}>{formattedBalance}</Text>
        <Text style={styles.walletHint}>
          You earn from tips and (later) ads. Withdrawals will be handled through
          your payout method.
        </Text>

        <View style={styles.walletButtonsRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/profile-feed")}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Loading..." : "View my vibes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              comingSoon("Withdrawals screen coming soon. For now, you can track your balance here.")
            }
          >
            <Text style={styles.secondaryButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryWideButton}
        onPress={() => comingSoon("Edit profile coming soon.")}
      >
        <Text style={styles.primaryWideButtonText}>Edit profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryWideButton}
        onPress={() => comingSoon("Share profile coming soon.")}
      >
        <Text style={styles.secondaryWideButtonText}>Share</Text>
      </TouchableOpacity>

      {/* SIGN OUT */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A12",
  },
  container: {
    padding: 20,
    paddingTop: 26,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "700",
    marginBottom: 6,
  },
  subTitle: {
    color: "#9CA3AF",
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },
  badgesRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "rgba(79,70,229,0.25)",
    borderColor: "#4F46E5",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeOutline: {
    backgroundColor: "transparent",
    borderColor: "rgba(79,70,229,0.35)",
  },
  badgeText: {
    color: "#E5E7EB",
    fontWeight: "600",
    fontSize: 12,
  },
  badgeOutlineText: {
    color: "#C7D2FE",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(17,24,39,0.8)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "#9CA3AF",
    marginTop: 4,
  },
  walletCard: {
    backgroundColor: "rgba(17,24,39,0.85)",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 16,
  },
  walletLabel: {
    color: "#9CA3AF",
    marginBottom: 6,
  },
  walletBalance: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  walletHint: {
    color: "#9CA3AF",
    lineHeight: 18,
    marginBottom: 14,
  },
  walletButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#E5E7EB",
    fontWeight: "700",
  },
  primaryWideButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryWideButtonText: {
    color: "white",
    fontWeight: "800",
  },
  secondaryWideButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryWideButtonText: {
    color: "#E5E7EB",
    fontWeight: "700",
  },
  signOutButton: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EF4444",
    alignItems: "center",
  },
  signOutText: {
    color: "#EF4444",
    fontWeight: "800",
  },
});
