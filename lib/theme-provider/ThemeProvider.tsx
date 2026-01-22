import { colors, ThemeColors, ThemeName } from "@/lib/theme";
import React, { createContext, useMemo, useState } from "react";

type ThemeContextValue = {
  mode: ThemeName;
  c: ThemeColors;
  setMode: (mode: ThemeName) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeName>("dark");

  const value = useMemo<ThemeContextValue>(() => {
    const c = colors[mode];
    return {
      mode,
      c,
      setMode,
      toggle: () => setMode((m) => (m === "dark" ? "light" : "dark")),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
