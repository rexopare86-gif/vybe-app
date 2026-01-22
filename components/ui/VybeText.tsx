import { typography } from "@/lib/theme";
import { useTheme } from "@/lib/theme-provider/useTheme";
import React from "react";
import { Text, TextProps } from "react-native";

type Variant = keyof typeof typography;

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
};

export function VybeText({ variant = "body", muted, style, ...props }: Props) {
  const { c } = useTheme();
  return (
    <Text
      {...props}
      style={[
        typography[variant],
        { color: muted ? c.textMuted : c.text },
        style,
      ]}
    />
  );
}
