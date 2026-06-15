import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { type Goal, useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { t } from "@/lib/i18n";
import { useAppContext } from "@/context/AppContext";
import { ThreeDotsMenu } from "./ThreeDotsMenu";
import { ProgressBar } from "./ProgressBar";

interface GoalCardProps {
  goal: Goal;
  onEdit?: () => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const colors = useColors();
  const { language } = useAppContext();
  const { completeGoal, uncompleteGoal, toggleSubTask, deleteGoal } = useData();
  const [expanded, setExpanded] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const subtaskProgress =
    goal.subTasks.length > 0
      ? goal.subTasks.filter((s) => s.isCompleted).length / goal.subTasks.length
      : 0;

  const menuOptions = [
    ...(onEdit ? [{ label: t(language, "editGoal"), onPress: onEdit }] : []),
    {
      label: goal.isCompleted ? t(language, "undo") : t(language, "completed"),
      onPress: () =>
        goal.isCompleted ? uncompleteGoal(goal.id) : completeGoal(goal.id),
    },
    {
      label: t(language, "deleteGoal"),
      destructive: true,
      onPress: () => deleteGoal(goal.id),
    },
  ];

  return (
    <>
      <Pressable
        onPress={() => setDetailVisible(true)}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: goal.isCompleted ? colors.primary : colors.border,
            shadowColor: goal.isCompleted ? colors.primary : colors.glow,
            borderLeftWidth: 3,
            borderLeftColor: goal.isCompleted ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              goal.isCompleted ? uncompleteGoal(goal.id) : completeGoal(goal.id)
            }
            hitSlop={8}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: goal.isCompleted ? colors.primary : colors.border,
                  backgroundColor: goal.isCompleted ? colors.primary : "transparent",
                  shadowColor: goal.isCompleted ? colors.primary : "transparent",
                  shadowOpacity: goal.isCompleted ? 0.7 : 0,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 0 },
                },
              ]}
            >
              {goal.isCompleted && (
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>✓</Text>
              )}
            </View>
          </Pressable>

          <View style={styles.titleArea}>
            <Text
              style={[
                styles.title,
                {
                  color: goal.isCompleted ? colors.mutedForeground : colors.text,
                  textDecorationLine: goal.isCompleted ? "line-through" : "none",
                },
              ]}
              numberOfLines={2}
            >
              {goal.title}
            </Text>
            {goal.timeframe && (
              <Text style={[styles.badge, { color: colors.neon, borderColor: colors.border }]}>
                {t(language, goal.timeframe)}
              </Text>
            )}
          </View>

          <ThreeDotsMenu options={menuOptions} />
        </View>

        {goal.subTasks.length > 0 && (
          <View style={styles.progressArea}>
            <ProgressBar progress={subtaskProgress} height={5} />
            <Text style={[styles.subCount, { color: colors.mutedForeground }]}>
              {goal.subTasks.filter((s) => s.isCompleted).length}/{goal.subTasks.length}{" "}
              {t(language, "subOf")}
            </Text>
          </View>
        )}
      </Pressable>

      <Modal visible={detailVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDetailVisible(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={2}>
              {goal.title}
            </Text>
            <Pressable onPress={() => setDetailVisible(false)} hitSlop={12}>
              <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>{t(language, "cancel")}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            {goal.description ? (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  {t(language, "goalDescription")}
                </Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>{goal.description}</Text>
              </View>
            ) : null}
            {goal.expectedOutcome ? (
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                <Text style={[styles.sectionLabel, { color: colors.neon }]}>
                  {t(language, "expectedOutcome")}
                </Text>
                <Text style={[styles.sectionText, { color: colors.text }]}>{goal.expectedOutcome}</Text>
              </View>
            ) : null}
            {goal.subTasks.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  {t(language, "subtasks")}
                </Text>
                {goal.subTasks.map((st) => (
                  <Pressable
                    key={st.id}
                    onPress={() => { toggleSubTask(goal.id, st.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={[styles.subtaskRow, { borderBottomColor: colors.border }]}
                  >
                    <View style={[styles.subCheck, { borderColor: st.isCompleted ? colors.primary : colors.border, backgroundColor: st.isCompleted ? colors.primary : "transparent" }]}>
                      {st.isCompleted && <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>✓</Text>}
                    </View>
                    <Text style={[styles.subText, { color: st.isCompleted ? colors.mutedForeground : colors.text, textDecorationLine: st.isCompleted ? "line-through" : "none" }]}>
                      {st.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Pressable
              onPress={() => { goal.isCompleted ? uncompleteGoal(goal.id) : completeGoal(goal.id); setDetailVisible(false); }}
              style={[styles.completeBtn, { backgroundColor: goal.isCompleted ? colors.secondary : colors.primary }]}
            >
              <Text style={{ color: goal.isCompleted ? colors.text : "#fff", fontWeight: "700", fontSize: 16 }}>
                {goal.isCompleted ? t(language, "undo") : t(language, "completed")}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 2 },
  titleArea: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: "600", lineHeight: 22 },
  badge: { fontSize: 11, borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start" },
  progressArea: { gap: 4 },
  subCount: { fontSize: 12 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, paddingTop: 24, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "700", flex: 1, marginRight: 12 },
  modalBody: { padding: 18, gap: 16, paddingBottom: 48 },
  section: { borderRadius: 12, padding: 14, gap: 8, borderWidth: 1, borderColor: "transparent" },
  sectionLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  sectionText: { fontSize: 15, lineHeight: 22 },
  subtaskRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  subCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  subText: { fontSize: 14, flex: 1 },
  completeBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
});
