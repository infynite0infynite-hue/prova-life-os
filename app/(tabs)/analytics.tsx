import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { useData } from "@/context/DataContext";
import { t } from "@/lib/i18n";
import { StarField } from "@/components/StarField";

type PeriodFilter = "all" | "today" | "week" | "month" | "year";

function isWithin(dateStr: string | null, period: PeriodFilter): boolean {
  if (!dateStr) return false;
  if (period === "all") return true;
  const d = new Date(dateStr);
  const now = new Date();
  if (period === "today") {
    return d.toDateString() === now.toDateString();
  }
  const diff = now.getTime() - d.getTime();
  const days = diff / 86400000;
  if (period === "week") return days <= 7;
  if (period === "month") return days <= 30;
  if (period === "year") return days <= 365;
  return false;
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, secretMode } = useAppContext();
  const { sections, goals } = useData();

  const universe = secretMode ? "secret" : "normal";
  const mySections = sections.filter((s) => s.universe === universe);
  const myGoals = goals.filter((g) => g.universe === universe);

  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const filteredAchievements = useMemo(() => {
    return myGoals
      .filter((g) => g.isCompleted && isWithin(g.completedAt, period))
      .filter((g) => !sectionFilter || g.sectionId === sectionFilter)
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  }, [myGoals, period, sectionFilter]);

  const handleExport = async () => {
    const lines = filteredAchievements.map((g) => {
      const sec = sections.find((s) => s.id === g.sectionId);
      const date = g.completedAt ? new Date(g.completedAt).toLocaleDateString() : "";
      return `• ${g.title}\n  [${sec?.name ?? ""}] — ${date}\n  Outcome: ${g.expectedOutcome || "—"}`;
    });
    const content = `ProvaLife OS — Achievement Report\n${"─".repeat(36)}\n${lines.join("\n\n")}`;
    await Share.share({ message: content, title: "ProvaLife OS Report" });
  };

  const periods: { key: PeriodFilter; label: string }[] = [
    { key: "all", label: t(language, "allSections") },
    { key: "today", label: t(language, "todayFilter") },
    { key: "week", label: t(language, "weekFilter") },
    { key: "month", label: t(language, "monthFilter") },
    { key: "year", label: t(language, "yearFilter") },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />

      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t(language, "achievementLog")}
        </Text>
        <Pressable
          onPress={handleExport}
          style={[styles.exportBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="share" size={16} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={filteredAchievements}
        keyExtractor={(g) => g.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.periodRow}>
                {periods.map((p) => (
                  <Pressable
                    key={p.key}
                    onPress={() => setPeriod(p.key)}
                    style={[
                      styles.periodChip,
                      {
                        backgroundColor: period === p.key ? colors.primary : colors.card,
                        borderColor: period === p.key ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: period === p.key ? "#fff" : colors.text,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {mySections.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.periodRow}>
                  <Pressable
                    onPress={() => setSectionFilter(null)}
                    style={[styles.periodChip, { backgroundColor: !sectionFilter ? colors.secondary : colors.card, borderColor: colors.border }]}
                  >
                    <Text style={{ color: !sectionFilter ? colors.primaryForeground : colors.text, fontSize: 13 }}>
                      {t(language, "allSections")}
                    </Text>
                  </Pressable>
                  {mySections.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => setSectionFilter(sectionFilter === s.id ? null : s.id)}
                      style={[styles.periodChip, { backgroundColor: sectionFilter === s.id ? s.color : colors.card, borderColor: s.color || colors.border }]}
                    >
                      <Text style={{ fontSize: 13, color: sectionFilter === s.id ? "#fff" : colors.text }}>
                        {s.emoji} {s.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}

            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {filteredAchievements.length} {t(language, "completedGoals")}
            </Text>
          </View>
        }
        renderItem={({ item: g }) => {
          const sec = sections.find((s) => s.id === g.sectionId);
          const date = g.completedAt ? new Date(g.completedAt).toLocaleDateString() : "";
          return (
            <View style={[styles.achieveCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sec?.color || colors.primary }]}>
              <View style={styles.achieveTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.achieveTitle, { color: colors.text }]}>{g.title}</Text>
                  {sec && (
                    <Text style={[styles.achieveSec, { color: sec.color || colors.mutedForeground }]}>
                      {sec.emoji} {sec.name}
                    </Text>
                  )}
                </View>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text>
              </View>
              {g.expectedOutcome ? (
                <View style={[styles.outcomeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.outcomeLabel, { color: colors.neon }]}>
                    {t(language, "outcome")}
                  </Text>
                  <Text style={[styles.outcomeText, { color: colors.text }]}>
                    {g.expectedOutcome}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 36 }}>🏆</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {t(language, "noAchievements")}
            </Text>
          </View>
        }
        contentContainerStyle={{ padding: 18, gap: 12, paddingBottom: bottomInset + 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  exportBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  filters: { gap: 10, marginBottom: 8 },
  periodRow: { flexDirection: "row", gap: 8 },
  periodChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  count: { fontSize: 13 },
  achieveCard: { borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderLeftWidth: 3 },
  achieveTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  achieveTitle: { fontSize: 15, fontWeight: "600" },
  achieveSec: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 12 },
  outcomeBox: { borderRadius: 10, padding: 10, gap: 4, borderWidth: 1 },
  outcomeLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  outcomeText: { fontSize: 14, lineHeight: 20 },
  empty: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 60 },
  emptyText: { fontSize: 15 },
});
