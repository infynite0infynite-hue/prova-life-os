import { useContext } from "react";
import { useColorScheme } from "react-native";

import colors from "@/constants/colors";
import { AppContext } from "@/context/AppContext";

/**
 * Returns design tokens for the active theme.
 * Prefers the manual theme toggle from AppContext;
 * falls back to system color scheme when outside the provider.
 */
export function useColors() {
  const ctx = useContext(AppContext);
  const systemScheme = useColorScheme();
  const resolved = ctx?.theme ?? (systemScheme === "dark" ? "dark" : "light");

  const palette =
    resolved === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;

  return { ...palette, radius: colors.radius };
}
