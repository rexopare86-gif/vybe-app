// app/(auth)/sign-in.tsx
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Common: email not confirmed
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          Alert.alert(
            "Sign in failed",
            "If you just signed up, confirm your email first (check inbox/spam). Then try again."
          );
          return;
        }
        throw error;
      }

      if (data.session) {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      Alert.alert("Sign in failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20, justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 16 }}>
        Sign in
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#777"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ backgroundColor: "#111", color: "#fff", padding: 14, borderRadius: 10, marginBottom: 10 }}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        style={{ backgroundColor: "#111", color: "#fff", padding: 14, borderRadius: 10, marginBottom: 14 }}
      />

      <TouchableOpacity
        onPress={onSignIn}
        disabled={loading}
        style={{ backgroundColor: "#1e90ff", padding: 14, borderRadius: 10, alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {loading ? "Signing in..." : "Sign in"}
        </Text>
      </TouchableOpacity>

      <Text style={{ color: "#aaa", marginTop: 16 }}>
        No account?{" "}
        <Link href="/(auth)/sign-up" style={{ color: "#1e90ff" }}>
          Create one
        </Link>
      </Text>
    </View>
  );
}
