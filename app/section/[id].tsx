import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { useData, type Goal, type SubTask, type Timeframe } from "@/context/DataContext";
import { t } from "@/lib/i18n";
import { StarField } from "@/components/StarField";
import { GoalCard } from "@/components/GoalCard";
import { CelebrationEffect } from "@/components/CelebrationEffect";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const TIMEFRAMES: Timeframe[] = ["daily", "weekly", "monthly", "yearly", "custom"];

interface GoalFormData {
  title: string;
  description: string;
  expectedOutcome: string;
  timeframe: Timeframe;
  customDays: string;
  subTasks: SubTask[];
  newSubtask: string;
}

export default function SectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { language, secretMode } = useAppContext();
  const { sections, goals, addGoal, updateGoal, celebratingGoalId, clearCelebration } = useData();

  const section = sections.find((s) => s.id === id);
  const sectionGoals = goals.filter((g) => g.sectionId === id);

  const [formVisible, setFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<GoalFormData>({
    title: "", description: "", expectedOutcome: "",
    timeframe: null, customDays: "", subTasks: [], newSubtask: "",
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const openAdd = () => {
    setEditingGoal(null);
    setForm({ title: "", description: "", expectedOutcome: "", timeframe: null, customDays: "", subTasks: [], newSubtask: "" });
    setFormVisible(true);
  };

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title, description: goal.description,
      expectedOutcome: goal.expectedOutcome, timeframe: goal.timeframe,
      customDays: goal.customDays?.toString() ?? "", subTasks: [...goal.subTasks], newSubtask: "",
    });
    setFormVisible(true);
  };

  const addSubtask = () => {
    if (!form.newSubtask.trim()) return;
    const st: SubTask = { id: uid(), title: form.newSubtask.trim(), isCompleted: false };
    setForm((f) => ({ ...f, subTasks: [...f.subTasks, st], newSubtask: "" }));
  };

  const removeSubtask = (stId: string) => {
    setForm((f) => ({ ...f, subTasks: f.subTasks.filter((s) => s.id !== stId) }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const universe = secretMode ? "secret" : "normal";
    const data = {
      sectionId: id!,
      title: form.title,
      description: form.description,
      expectedOutcome: form.expectedOutcome,
      timeframe: form.timeframe,
      customDays: form.timeframe === "custom" ? parseInt(form.customDays) || null : null,
      subTasks: form.subTasks,
      universe: universe as "normal" | "secret",
    };
    if (editingGoal) {
      updateGoal(editingGoal.id, data);
    } else {
      addGoal(data);
    }
    setFormVisible(false);
  };

  if (!section) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.text }}>Section not found</Text>
      </View>
    );
  }

  const activeGoals = sectionGoals.filter((g) => !g.isCompleted);
  const doneGoals = sectionGoals.filter((g) => g.isCompleted);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />
      <CelebrationEffect visible={!!celebratingGoalId} onDone={clearCelebration} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View
          style={[styles.emojiCircle, { backgroundColor: (section.color || colors.primary) + "25" }]}
        >
          <Text style={{ fontSize: 22 }}>{section.emoji || "📌"}</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {section.name}
        </Text>
        <Pressable
          onPress={openAdd}
          style={[styles.addBtn, { backgroundColor: section.color || colors.primary }]}
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      {sectionGoals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🎯</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {t(language, "noGoals")}
          </Text>
          <Pressable
            onPress={openAdd}
            style={[styles.emptyBtn, { borderColor: section.color || colors.primary }]}
          >
            <Text style={{ color: section.color || colors.primary, fontWeight: "600" }}>
              {t(language, "addGoal")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={[...activeGoals, ...doneGoals]}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: 18, gap: 12, paddingBottom: bottomInset + 80 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            doneGoals.length > 0 && activeGoals.length > 0 ? (
              <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>
                {t(language, "active")} ({activeGoals.length})
              </Text>
            ) : null
          }
          renderItem={({ item: g, index }) => (
            <View>
              {index === activeGoals.length && doneGoals.length > 0 && (
                <Text style={[styles.groupLabel, { color: colors.mutedForeground, marginBottom: 8, marginTop: index > 0 ? 8 : 0 }]}>
                  {t(language, "completed")} ({doneGoals.length})
                </Text>
              )}
              <GoalCard goal={g} onEdit={() => openEdit(g)} />
            </View>
          )}
        />
      )}

      {/* Goal Form Modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={[styles.formModal, { backgroundColor: colors.background }]}>
          <View style={[styles.formHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {editingGoal ? t(language, "editGoal") : t(language, "addGoal")}
            </Text>
            <Pressable onPress={() => setFormVisible(false)} hitSlop={12}>
              <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>
                {t(language, "cancel")}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.formBody}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "goalTitle")} *
            </Text>
            <TextInput
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
              placeholder={t(language, "goalTitle")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "goalDescription")}
            </Text>
            <TextInput
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder={t(language, "goalDescription")}
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[styles.input, styles.multiline, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "expectedOutcome")}
            </Text>
            <TextInput
              value={form.expectedOutcome}
              onChangeText={(v) => setForm((f) => ({ ...f, expectedOutcome: v }))}
              placeholder={t(language, "whatChanges")}
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={2}
              style={[styles.input, styles.multiline, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "timeframe")}
            </Text>
            <View style={styles.timeframeRow}>
              {TIMEFRAMES.map((tf) => (
                <Pressable
                  key={tf ?? "none"}
                  onPress={() => setForm((f) => ({ ...f, timeframe: f.timeframe === tf ? null : tf }))}
                  style={[
                    styles.tfChip,
                    {
                      backgroundColor: form.timeframe === tf ? colors.primary : colors.card,
                      borderColor: form.timeframe === tf ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: form.timeframe === tf ? "#fff" : colors.text, fontSize: 13 }}>
                    {t(language, tf ?? "daily")}
                  </Text>
                </Pressable>
              ))}
            </View>

            {form.timeframe === "custom" && (
              <TextInput
                value={form.customDays}
                onChangeText={(v) => setForm((f) => ({ ...f, customDays: v.replace(/\D/g, "") }))}
                placeholder={t(language, "customDays")}
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              />
            )}

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "subtasks")}
            </Text>
            {form.subTasks.map((st) => (
              <View key={st.id} style={[styles.subtaskRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.subDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.subText, { color: colors.text }]}>{st.title}</Text>
                <Pressable onPress={() => removeSubtask(st.id)} hitSlop={8}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
            <View style={styles.addSubRow}>
              <TextInput
                value={form.newSubtask}
                onChangeText={(v) => setForm((f) => ({ ...f, newSubtask: v }))}
                placeholder={t(language, "addSubtask")}
                placeholderTextColor={colors.mutedForeground}
                onSubmitEditing={addSubtask}
                style={[styles.subInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              />
              <Pressable onPress={addSubtask} style={[styles.subAddBtn, { backgroundColor: colors.primary }]}>
                <Feather name="plus" size={18} color="#fff" />
              </Pressable>
            </View>

            <Pressable
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: form.title.trim() ? 1 : 0.5 }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {t(language, "save")}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  emojiCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  title: { flex: 1, fontSize: 18, fontWeight: "700" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  emptyBtn: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  groupLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  formModal: { flex: 1 },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, paddingTop: 24, borderBottomWidth: 1 },
  formTitle: { fontSize: 20, fontWeight: "700" },
  formBody: { padding: 18, gap: 12, paddingBottom: 48 },
  fieldLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15 },
  multiline: { minHeight: 72, textAlignVertical: "top" },
  timeframeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tfChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  subtaskRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  subDot: { width: 8, height: 8, borderRadius: 4 },
  subText: { flex: 1, fontSize: 14 },
  addSubRow: { flexDirection: "row", gap: 10 },
  subInput: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14 },
  subAddBtn: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
});
