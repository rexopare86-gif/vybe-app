import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Amount = 1 | 5 | 10 | 20 | 50;

type Props = {
  visible: boolean;
  busy?: boolean;
  onClose: () => void;

  // ✅ support BOTH (so you never break screens again)
  onPick?: (amount: Amount) => void;
  onConfirm?: (amount: Amount) => void;

  title?: string;
  subtitle?: string;
};

export default function TipPickerModal({
  visible,
  busy,
  onClose,
  onPick,
  onConfirm,
  title = "Send tip",
  subtitle = "Choose an amount",
}: Props) {
  const amounts: Amount[] = [1, 5, 10, 20, 50];
  const handler = onPick ?? onConfirm;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.sub}>{subtitle}</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {amounts.map((a) => (
              <Pressable
                key={a}
                disabled={busy || !handler}
                style={[styles.amountBtn, (busy || !handler) && { opacity: 0.5 }]}
                onPress={() => handler?.(a)}
              >
                <Text style={styles.amountText}>🪙 {a}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable disabled={busy} onPress={onClose} style={[styles.cancelBtn, busy && { opacity: 0.6 }]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          {busy ? <Text style={styles.busy}>Sending…</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0f0f0f",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1b1b1b",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "900" },
  sub: { color: "#aaa", marginTop: 4 },

  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  closeText: { color: "#fff", fontWeight: "900" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
    marginTop: 6,
  },
  amountBtn: {
    width: "48%",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
  },
  amountText: { color: "#fff", fontWeight: "900", fontSize: 16 },

  cancelBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#242424",
    alignItems: "center",
  },
  cancelText: { color: "#ddd", fontWeight: "800" },

  busy: { color: "#999", marginTop: 10, textAlign: "center" },
});
