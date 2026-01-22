// app/(auth)/sign-up.tsx
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../../lib/supabase";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // If email confirmation is ON, session is usually null here.
      if (!data.session) {
        Alert.alert(
          "Account created",
          "Check your email to confirm your account, then sign in."
        );
        router.replace("/(auth)/sign-in");
        return;
      }

      // If confirmation is OFF, user may be signed in immediately.
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Sign up failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20, justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 16 }}>
        Create account
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
        placeholder="Password (min 6 chars)"
        placeholderTextColor="#777"
        secureTextEntry
        style={{ backgroundColor: "#111", color: "#fff", padding: 14, borderRadius: 10, marginBottom: 14 }}
      />

      <TouchableOpacity
        onPress={onSignUp}
        disabled={loading}
        style={{ backgroundColor: "#1e90ff", padding: 14, borderRadius: 10, alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          {loading ? "Creating..." : "Sign up"}
        </Text>
      </TouchableOpacity>

      <Text style={{ color: "#aaa", marginTop: 16 }}>
        Already have an account?{" "}
        <Link href="/(auth)/sign-in" style={{ color: "#1e90ff" }}>
          Sign in
        </Link>
      </Text>
    </View>
  );
}
