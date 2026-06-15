import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { useData, type Section } from "@/context/DataContext";
import { t } from "@/lib/i18n";
import { StarField } from "@/components/StarField";
import { ThreeDotsMenu } from "@/components/ThreeDotsMenu";
import { ProgressBar } from "@/components/ProgressBar";

const SECTION_COLORS = [
  "#9333EA", "#7C3AED", "#6D28D9", "#C084FC", "#818CF8",
  "#F472B6", "#34D399", "#FBBF24", "#60A5FA", "#F87171",
];
const EMOJIS = ["🎯", "💪", "🚀", "📚", "💡", "🌟", "❤️", "🎨", "💼", "🏆",
  "🧠", "💎", "🌱", "🔥", "⚡", "🎵", "🏃", "✈️", "🍀", "🌙"];

interface SectionFormData {
  name: string;
  emoji: string;
  color: string;
}

export default function SectionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { language, secretMode } = useAppContext();
  const { sections, goals, addSection, updateSection, deleteSection, makeSectionSecret } = useData();

  const universe = secretMode ? "secret" : "normal";
  const mySections = sections.filter((s) => s.universe === universe);

  const [formVisible, setFormVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [form, setForm] = useState<SectionFormData>({ name: "", emoji: "🎯", color: SECTION_COLORS[0] });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const openAdd = () => {
    setEditingSection(null);
    setForm({ name: "", emoji: "🎯", color: SECTION_COLORS[0] });
    setFormVisible(true);
  };

  const openEdit = (s: Section) => {
    setEditingSection(s);
    setForm({ name: s.name, emoji: s.emoji, color: s.color });
    setFormVisible(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingSection) {
      updateSection(editingSection.id, { name: form.name, emoji: form.emoji, color: form.color });
    } else {
      addSection({ name: form.name, emoji: form.emoji, color: form.color, universe });
    }
    setFormVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t(language, "sections")}
        </Text>
        <Pressable
          onPress={openAdd}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      {/* Sections List */}
      {mySections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>🌌</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {t(language, "noSections")}
          </Text>
          <Pressable
            onPress={openAdd}
            style={[styles.emptyBtn, { borderColor: colors.primary }]}
          >
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {t(language, "addSection")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={mySections}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{
            padding: 18,
            gap: 14,
            paddingBottom: bottomInset + 100,
          }}
          scrollEnabled={!!mySections.length}
          renderItem={({ item: sec }) => {
            const secGoals = goals.filter((g) => g.sectionId === sec.id);
            const done = secGoals.filter((g) => g.isCompleted).length;
            const pct = secGoals.length > 0 ? done / secGoals.length : 0;
            const menuOpts = [
              { label: t(language, "editSection"), onPress: () => openEdit(sec) },
              ...(universe === "normal"
                ? [{ label: t(language, "makeSecret"), onPress: () => makeSectionSecret(sec.id) }]
                : []),
              { label: t(language, "deleteSection"), destructive: true, onPress: () => deleteSection(sec.id) },
            ];
            return (
              <Pressable
                onPress={() => router.push(`/section/${sec.id}`)}
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: sec.color || colors.border,
                    shadowColor: sec.color || colors.glow,
                  },
                ]}
              >
                <View style={styles.secHeader}>
                  <View
                    style={[
                      styles.emojiCircle,
                      { backgroundColor: sec.color + "25" },
                    ]}
                  >
                    <Text style={styles.emoji}>{sec.emoji || "📌"}</Text>
                  </View>
                  <View style={styles.secInfo}>
                    <Text style={[styles.secName, { color: colors.text }]}>{sec.name}</Text>
                    <Text style={[styles.secMeta, { color: colors.mutedForeground }]}>
                      {secGoals.length} {t(language, "totalGoals")} · {done} {t(language, "completed")}
                    </Text>
                  </View>
                  <ThreeDotsMenu options={menuOpts} />
                </View>
                {secGoals.length > 0 && (
                  <ProgressBar progress={pct} height={6} color={sec.color} showLabel />
                )}
              </Pressable>
            );
          }}
        />
      )}

      {/* Section Form Modal */}
      <Modal
        visible={formVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFormVisible(false)}
      >
        <ScrollView
          style={[styles.formModal, { backgroundColor: colors.background }]}
          contentContainerStyle={{ paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {editingSection ? t(language, "editSection") : t(language, "addSection")}
            </Text>
            <Pressable onPress={() => setFormVisible(false)} hitSlop={12}>
              <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>
                {t(language, "cancel")}
              </Text>
            </Pressable>
          </View>

          <View style={styles.formBody}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "sectionName")}
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder={t(language, "sectionName")}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "sectionEmoji")}
            </Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => setForm((f) => ({ ...f, emoji }))}
                  style={[
                    styles.emojiOption,
                    {
                      backgroundColor:
                        form.emoji === emoji ? colors.primary : colors.card,
                      borderColor: form.emoji === emoji ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
              {t(language, "sectionColor")}
            </Text>
            <View style={styles.colorRow}>
              {SECTION_COLORS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setForm((f) => ({ ...f, color: c }))}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: c,
                      transform: [{ scale: form.color === c ? 1.3 : 1 }],
                      borderWidth: form.color === c ? 3 : 0,
                      borderColor: "#fff",
                    },
                  ]}
                />
              ))}
            </View>

            <Pressable
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: form.name.trim() ? 1 : 0.5 }]}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {t(language, "save")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  addBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  emptyBtn: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  sectionCard: {
    borderRadius: 18, padding: 16, gap: 12, borderWidth: 1,
    shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  secHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  emojiCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 24 },
  secInfo: { flex: 1, gap: 2 },
  secName: { fontSize: 16, fontWeight: "700" },
  secMeta: { fontSize: 12 },
  formModal: { flex: 1 },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, paddingTop: 24, borderBottomWidth: 1 },
  formTitle: { fontSize: 20, fontWeight: "700" },
  formBody: { padding: 18, gap: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  input: { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15 },
  emojiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emojiOption: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  saveBtn: { borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8 },
});
