export const colors = {
  dark: {
    bg: "#0B0B10",
    surface: "#12121A",
    surface2: "#171723",
    text: "#FFFFFF",
    textMuted: "rgba(255,255,255,0.72)",
    textFaint: "rgba(255,255,255,0.55)",
    border: "rgba(255,255,255,0.10)",

    // Vybe signature (modern, not TikTok copy)
    brandA: "#8B5CF6", // violet
    brandB: "#22D3EE", // cyan
    danger: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
  },

  light: {
    bg: "#FFFFFF",
    surface: "#F6F7FB",
    surface2: "#FFFFFF",
    text: "#0B0B10",
    textMuted: "rgba(11,11,16,0.72)",
    textFaint: "rgba(11,11,16,0.55)",
    border: "rgba(11,11,16,0.10)",

    brandA: "#7C3AED",
    brandB: "#06B6D4",
    danger: "#DC2626",
    success: "#16A34A",
    warning: "#D97706",
  },
} as const;

export type ThemeName = keyof typeof colors;
export type ThemeColors = (typeof colors)[ThemeName];
