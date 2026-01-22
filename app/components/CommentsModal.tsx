// app/components/CommentsModal.tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { addComment, CommentRow, listComments } from "../../lib/comments";

type Props = {
  visible: boolean;
  videoId: string;
  onClose: () => void;
};

export default function CommentsModal({ visible, videoId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      const data = await listComments(videoId);
      setRows(data);
    } catch (e) {
      console.log("Comments load error", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (visible && videoId) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, videoId]);

  async function send() {
    try {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (sending) return;

      setSending(true);
      await addComment(videoId, trimmed);
      setText("");
      await refresh();
    } catch (e: any) {
      alert(e?.message ?? "Failed to comment");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.title}>Comments</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {/* List */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={styles.muted}>Loading…</Text>
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 80 }}
              renderItem={({ item }) => {
                const name = item.profiles?.username ?? "user";
                return (
                  <View style={styles.row}>
                    <Text style={styles.rowUser}>@{name}</Text>
                    <Text style={styles.rowText}>{item.text}</Text>
                    <Text style={styles.rowTime}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>Be the first to comment 👇</Text>
              }
            />
          )}

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
          >
            <View style={styles.inputRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Add a comment…"
                placeholderTextColor="#777"
                style={styles.input}
                multiline
              />
              <Pressable
                onPress={send}
                style={[
                  styles.sendBtn,
                  (!text.trim() || sending) && { opacity: 0.5 },
                ]}
                disabled={!text.trim() || sending}
              >
                <Text style={styles.sendText}>{sending ? "…" : "Send"}</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "80%",
    backgroundColor: "#0b0b0b",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: "#1b1b1b",
    overflow: "hidden",
  },
  topBar: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1b1b1b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "900" },
  close: { color: "#fff", fontSize: 18, padding: 6 },

  center: { paddingTop: 30, alignItems: "center" },
  muted: { color: "#888", marginTop: 10 },

  row: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#141414",
  },
  rowUser: { color: "#fff", fontWeight: "900", marginBottom: 6 },
  rowText: { color: "#ddd", lineHeight: 18 },
  rowTime: { color: "#666", marginTop: 8, fontSize: 12 },

  empty: { color: "#777", padding: 18, textAlign: "center" },

  inputRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: "#0b0b0b",
    borderTopWidth: 1,
    borderTopColor: "#1b1b1b",
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "900" },
});
