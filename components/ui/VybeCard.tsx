import { radius, shadows } from "@/lib/theme";
import { useTheme } from "@/lib/theme-provider/useTheme";
import React from "react";
import { View, ViewProps } from "react-native";

type Props = ViewProps & {
  variant?: "surface" | "surface2";
};

export function VybeCard({ variant = "surface", style, ...props }: Props) {
  const { c } = useTheme();
  const bg = variant === "surface" ? c.surface : c.surface2;

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: c.border,
          padding: 16,
          ...shadows.soft,
        },
        style,
      ]}
    />
  );
}
