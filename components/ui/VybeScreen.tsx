import { useTheme } from "@/lib/theme-provider/useTheme";
import React from "react";
import { View, ViewProps } from "react-native";

type Props = ViewProps & {
  padded?: boolean;
};

export function VybeScreen({ padded = true, style, ...props }: Props) {
  const { c } = useTheme();
  return (
    <View
      {...props}
      style={[
        { flex: 1, backgroundColor: c.bg, paddingHorizontal: padded ? 16 : 0 },
        style,
      ]}
    />
  );
}
