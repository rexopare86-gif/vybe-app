import { radius } from "@/lib/theme";
import { useTheme } from "@/lib/theme-provider/useTheme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import { VybeText } from "./VybeText";

type Props = PressableProps & {
  title: string;
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
};

export function VybeButton({
  title,
  variant = "primary",
  fullWidth,
  style,
  ...props
}: Props) {
  const { c } = useTheme();

  const base: ViewStyle = {
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    width: fullWidth ? "100%" : undefined,
  };

  if (variant === "ghost") {
    return (
      <Pressable
        {...props}
        style={({ pressed }) => [
          base,
          {
            backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent",
            borderWidth: 1,
            borderColor: c.border,
          },
          typeof style === "function" ? style({ pressed }) : style,
        ]}
      >
        <VybeText variant="bodyStrong">{title}</VybeText>
      </Pressable>
    );
  }

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        base,
        { opacity: pressed ? 0.88 : 1 },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
    >
      <LinearGradient
        colors={[c.brandA, c.brandB]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ ...base, paddingVertical: 12, paddingHorizontal: 16 }}
      >
        <VybeText variant="bodyStrong" style={{ color: "#fff" }}>
          {title}
        </VybeText>
      </LinearGradient>
    </Pressable>
  );
}
