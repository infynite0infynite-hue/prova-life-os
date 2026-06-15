import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export default function TabLayout() {
  const colors = useColors();
  const { secretMode, language } = useAppContext();
  const isIOS = Platform.OS === "ios";

  return (
    <>
      {secretMode && (
        <View style={[styles.secretBanner, { backgroundColor: "#3B0764" }]}>
          <Text style={styles.secretText}>🔒 {t(language, "secretMode")}</Text>
        </View>
      )}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.background,
            borderTopWidth: 0,
            borderTopColor: "transparent",
            elevation: 0,
            height: Platform.OS === "web" ? 84 : undefined,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={90}
                tint={colors.background === "#08000F" ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }]} />
            ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t(language, "dashboard"),
            tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="sections"
          options={{
            title: t(language, "sections"),
            tabBarIcon: ({ color }) => <Feather name="layers" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: t(language, "analytics"),
            tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t(language, "settings"),
            tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  secretBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 4,
    alignItems: "center",
  },
  secretText: { color: "#E9D5FF", fontSize: 11, fontWeight: "700", letterSpacing: 2 },
});
