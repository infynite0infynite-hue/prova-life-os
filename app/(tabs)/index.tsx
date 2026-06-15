import React, { useMemo } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { useData } from "@/context/DataContext";
import { t } from "@/lib/i18n";
import { StarField } from "@/components/StarField";
import { ProgressBar } from "@/components/ProgressBar";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { GoalCard } from "@/components/GoalCard";

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, secretMode, theme } = useAppContext();
  const { sections, goals, celebratingGoalId, clearCelebration } = useData();

  const universe = secretMode ? "secret" : "normal";

  const mySections = useMemo(
    () => sections.filter((s) => s.universe === universe),
    [sections, universe]
  );
  const myGoals = useMemo(
    () => goals.filter((g) => g.universe === universe),
    [goals, universe]
  );

  const totalGoals = myGoals.length;
  const completedGoals = myGoals.filter((g) => g.isCompleted).length;
  const activeGoals = myGoals.filter((g) => !g.isCompleted);
  const progress = totalGoals > 0 ? completedGoals / totalGoals : 0;

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />
      <CelebrationEffect visible={!!celebratingGoalId} onDone={clearCelebration} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topInset + 16, paddingBottom: bottomInset + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={[styles.logoSmall, { borderColor: colors.border }]}
              resizeMode="contain"
            />
            <View>
              <Text style={[styles.appName, { color: colors.primary }]}>
                {t(language, "appName")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                {t(language, "dashboard")}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/(tabs)/settings")}
            hitSlop={12}
            style={[styles.iconBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Progress Card */}
        <View
          style={[
            styles.progressCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{totalGoals}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {t(language, "totalGoals")}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.neon }]}>{completedGoals}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {t(language, "completedGoals")}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statNum, { color: colors.text }]}>
                {Math.round(progress * 100)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {t(language, "overallProgress")}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <ProgressBar progress={progress} height={10} />
            </View>
          </View>
        </View>

        {/* Sections Summary */}
        {mySections.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.groupTitle, { color: colors.text }]}>
              {t(language, "sections")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionChips}>
              {mySections.map((sec) => {
                const secGoals = myGoals.filter((g) => g.sectionId === sec.id);
                const done = secGoals.filter((g) => g.isCompleted).length;
                const pct = secGoals.length > 0 ? done / secGoals.length : 0;
                return (
                  <Pressable
                    key={sec.id}
                    onPress={() => router.push(`/section/${sec.id}`)}
                    style={[
                      styles.sectionChip,
                      { backgroundColor: colors.card, borderColor: sec.color || colors.border, shadowColor: sec.color || colors.glow },
                    ]}
                  >
                    <Text style={styles.chipEmoji}>{sec.emoji || "📌"}</Text>
                    <Text style={[styles.chipName, { color: colors.text }]} numberOfLines={1}>
                      {sec.name}
                    </Text>
                    <View style={{ width: 48 }}>
                      <ProgressBar progress={pct} height={4} color={sec.color} />
                    </View>
                    <Text style={[styles.chipPct, { color: colors.mutedForeground }]}>
                      {Math.round(pct * 100)}%
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.groupTitle, { color: colors.text }]}>
              {t(language, "active")}
            </Text>
            <View style={styles.goalList}>
              {activeGoals.slice(0, 5).map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
              {activeGoals.length > 5 && (
                <Pressable
                  onPress={() => router.push("/(tabs)/sections")}
                  style={[styles.viewAllBtn, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.primary, fontWeight: "600" }}>
                    +{activeGoals.length - 5} more
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {totalGoals === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 32 }}>🌌</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {secretMode ? t(language, "secretUniverse") : t(language, "appName")}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t(language, "noSections")}
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/sections")}
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {t(language, "addSection")}
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 18, gap: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoSmall: { width: 44, height: 44, borderRadius: 12, borderWidth: 1 },
  appName: { fontSize: 20, fontWeight: "800", letterSpacing: 1.5 },
  subtitle: { fontSize: 12, letterSpacing: 0.5 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  progressCard: {
    borderRadius: 18, padding: 18, gap: 14,
    borderWidth: 1, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  stat: { alignItems: "center", gap: 4 },
  statNum: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 11, textAlign: "center" },
  statDivider: { width: 1, height: 40 },
  sectionGroup: { gap: 12 },
  groupTitle: { fontSize: 17, fontWeight: "700" },
  sectionChips: { gap: 12, paddingRight: 4 },
  sectionChip: {
    borderRadius: 14, padding: 14, gap: 4, borderWidth: 1,
    alignItems: "center", width: 100,
    shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  chipEmoji: { fontSize: 22 },
  chipName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  chipPct: { fontSize: 11 },
  goalList: { gap: 10 },
  viewAllBtn: { borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "center" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 60 },
  emptyTitle: { fontSize: 22, fontWeight: "800" },
  emptyText: { fontSize: 15, textAlign: "center" },
  addBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
});
