import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAppContext } from "@/context/AppContext";
import { useData } from "@/context/DataContext";
import { t, type Language } from "@/lib/i18n";
import { StarField } from "@/components/StarField";
import { PinPad } from "@/components/PinPad";

type PasscodeFlow =
  | "setApp" | "changeApp_current" | "changeApp_new" | "changeApp_confirm"
  | "disableApp_current"
  | "setSecret" | "changeSecret_current" | "changeSecret_new" | "changeSecret_confirm"
  | "disableSecret_current"
  | "accessSecret";

const LANGUAGES: { key: Language; label: string }[] = [
  { key: "en", label: "English" },
  { key: "ar", label: "العربية" },
  { key: "tr", label: "Türkçe" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    theme, toggleTheme, language, setLanguage,
    appPasscode, secretPasscode,
    setAppPasscode, setSecretPasscode,
    verifyAppPasscode, verifySecretPasscode,
    setIsLocked, setSecretMode, secretMode,
    resetAllPasscodes,
  } = useAppContext();
  const { sections, goals } = useData();

  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinFlow, setPinFlow] = useState<PasscodeFlow>("setApp");
  const [pinError, setPinError] = useState("");
  const [pendingCode, setPendingCode] = useState("");
  const [resetVisible, setResetVisible] = useState(false);
  const [resetInput, setResetInput] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : 0;

  const startFlow = (flow: PasscodeFlow) => {
    setPinFlow(flow);
    setPinError("");
    setPendingCode("");
    setPinModalVisible(true);
  };

  const handlePin = async (code: string) => {
    setPinError("");

    if (pinFlow === "setApp") {
      setPendingCode(code);
      setPinFlow("changeApp_confirm");
      return;
    }
    if (pinFlow === "changeApp_confirm") {
      if (code !== pendingCode) { setPinError(t(language, "passcodesMismatch")); return; }
      await setAppPasscode(code);
      setPinModalVisible(false);
      return;
    }
    if (pinFlow === "changeApp_current") {
      if (!verifyAppPasscode(code)) { setPinError(t(language, "wrongPasscode")); return; }
      setPinFlow("changeApp_new");
      return;
    }
    if (pinFlow === "changeApp_new") {
      setPendingCode(code);
      setPinFlow("changeApp_confirm");
      return;
    }
    if (pinFlow === "disableApp_current") {
      if (!verifyAppPasscode(code)) { setPinError(t(language, "wrongPasscode")); return; }
      await setAppPasscode(null);
      setPinModalVisible(false);
      return;
    }
    if (pinFlow === "setSecret") {
      setPendingCode(code);
      setPinFlow("changeSecret_confirm");
      return;
    }
    if (pinFlow === "changeSecret_confirm") {
      if (code !== pendingCode) { setPinError(t(language, "passcodesMismatch")); return; }
      await setSecretPasscode(code);
      setPinModalVisible(false);
      return;
    }
    if (pinFlow === "changeSecret_current") {
      if (!verifySecretPasscode(code)) { setPinError(t(language, "wrongPasscode")); return; }
      setPinFlow("changeSecret_new");
      return;
    }
    if (pinFlow === "changeSecret_new") {
      setPendingCode(code);
      setPinFlow("changeSecret_confirm");
      return;
    }
    if (pinFlow === "disableSecret_current") {
      if (!verifySecretPasscode(code)) { setPinError(t(language, "wrongPasscode")); return; }
      await setSecretPasscode(null);
      setPinModalVisible(false);
      return;
    }
    if (pinFlow === "accessSecret") {
      if (!verifySecretPasscode(code)) { setPinError(t(language, "wrongPasscode")); return; }
      setSecretMode(true);
      setPinModalVisible(false);
      return;
    }
  };

  const getPinLabel = (): string => {
    const m: Record<PasscodeFlow, string> = {
      setApp: t(language, "enterNewPasscode"),
      changeApp_current: t(language, "currentPasscode"),
      changeApp_new: t(language, "enterNewPasscode"),
      changeApp_confirm: t(language, "confirmPasscode"),
      disableApp_current: t(language, "currentPasscode"),
      setSecret: t(language, "enterNewPasscode"),
      changeSecret_current: t(language, "currentPasscode"),
      changeSecret_new: t(language, "enterNewPasscode"),
      changeSecret_confirm: t(language, "confirmPasscode"),
      disableSecret_current: t(language, "currentPasscode"),
      accessSecret: t(language, "enterSecretCode"),
    };
    return m[pinFlow];
  };

  const handleExportBackup = async () => {
    if (secretPasscode) {
      startFlow("disableSecret_current");
      return;
    }
    doExport();
  };

  const doExport = async () => {
    const data = JSON.stringify({ sections, goals, exportedAt: new Date().toISOString() }, null, 2);
    await Share.share({ message: data, title: "ProvaLife OS Backup" });
  };

  const handleReset = async () => {
    if (resetInput.trim() === "MYLIFEPROVASIX") {
      await resetAllPasscodes();
      setResetVisible(false);
      setResetInput("");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />

      <View style={[styles.header, { paddingTop: topInset + 8, borderBottomColor: colors.border }]}>
        <Image source={require("../../assets/images/icon.png")} style={[styles.logo, { borderColor: colors.border }]} />
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t(language, "settings")}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{t(language, "appName")}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 100 }]}>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t(language, "appearance")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable onPress={toggleTheme} style={styles.row}>
            <Feather name={theme === "dark" ? "moon" : "sun"} size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>
              {theme === "dark" ? t(language, "darkMode") : t(language, "lightMode")}
            </Text>
            <View style={[styles.toggle, { backgroundColor: theme === "dark" ? colors.primary : colors.muted }]}>
              <View style={[styles.toggleThumb, { left: theme === "dark" ? 22 : 2 }]} />
            </View>
          </Pressable>
        </View>

        {/* Language */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t(language, "language")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {LANGUAGES.map((lng, i) => (
            <Pressable
              key={lng.key}
              onPress={() => setLanguage(lng.key)}
              style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <Feather name="globe" size={20} color={colors.primary} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>{lng.label}</Text>
              {language === lng.key && <Feather name="check" size={20} color={colors.primary} />}
            </Pressable>
          ))}
        </View>

        {/* Security */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t(language, "security")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!appPasscode ? (
            <Pressable onPress={() => startFlow("setApp")} style={styles.row}>
              <Feather name="lock" size={20} color={colors.primary} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t(language, "enablePasscode")}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : (
            <>
              <Pressable onPress={() => startFlow("changeApp_current")} style={styles.row}>
                <Feather name="edit-2" size={20} color={colors.primary} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>{t(language, "changePasscode")}</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
              <Pressable onPress={() => startFlow("disableApp_current")} style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Feather name="unlock" size={20} color={colors.destructive} />
                <Text style={[styles.rowLabel, { color: colors.destructive }]}>{t(language, "disablePasscode")}</Text>
              </Pressable>
            </>
          )}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <Feather name="alert-circle" size={20} color={colors.mutedForeground} />
            <Pressable onPress={() => setResetVisible(true)}>
              <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{t(language, "forgotPasscode")}</Text>
            </Pressable>
          </View>
        </View>

        {/* Secret Universe */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t(language, "secretUniverse")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {!secretPasscode ? (
            <Pressable onPress={() => startFlow("setSecret")} style={styles.row}>
              <Feather name="eye-off" size={20} color={colors.neon} />
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t(language, "enablePasscode")}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : (
            <>
              {!secretMode ? (
                <Pressable onPress={() => startFlow("accessSecret")} style={styles.row}>
                  <Feather name="lock" size={20} color={colors.neon} />
                  <Text style={[styles.rowLabel, { color: colors.neon }]}>{t(language, "enterSecretUniverse")}</Text>
                  <Feather name="chevron-right" size={18} color={colors.neon} />
                </Pressable>
              ) : (
                <Pressable onPress={() => setSecretMode(false)} style={styles.row}>
                  <Feather name="log-out" size={20} color={colors.primary} />
                  <Text style={[styles.rowLabel, { color: colors.primary }]}>{t(language, "exitSecretUniverse")}</Text>
                </Pressable>
              )}
              <Pressable onPress={() => startFlow("changeSecret_current")} style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Feather name="edit-2" size={20} color={colors.primary} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>{t(language, "changePasscode")}</Text>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
              <Pressable onPress={() => startFlow("disableSecret_current")} style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Feather name="unlock" size={20} color={colors.destructive} />
                <Text style={[styles.rowLabel, { color: colors.destructive }]}>{t(language, "disablePasscode")}</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Data */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{t(language, "data")}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable onPress={handleExportBackup} style={styles.row}>
            <Feather name="download" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t(language, "backup")}</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{t(language, "backupInfo")}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>
      </ScrollView>

      {/* PIN Modal */}
      <Modal visible={pinModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPinModalVisible(false)}>
        <View style={[styles.pinModal, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => setPinModalVisible(false)} style={styles.closeBtn} hitSlop={16}>
            <Text style={{ color: colors.mutedForeground, fontSize: 16 }}>{t(language, "cancel")}</Text>
          </Pressable>
          <PinPad
            onComplete={handlePin}
            error={pinError}
            label={getPinLabel()}
          />
        </View>
      </Modal>

      {/* Reset Modal */}
      <Modal visible={resetVisible} transparent animationType="slide" onRequestClose={() => setResetVisible(false)}>
        <View style={styles.overlay}>
          <View style={[styles.resetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.resetTitle, { color: colors.text }]}>{t(language, "forgotPasscode")}</Text>
            <Text style={[styles.resetHint, { color: colors.mutedForeground }]}>{t(language, "resetHint")}</Text>
            <TextInput
              value={resetInput}
              onChangeText={setResetInput}
              placeholder="MYLIFEPROVASIX"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={[styles.resetInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => setResetVisible(false)} style={[styles.btn, { backgroundColor: colors.secondary }]}>
                <Text style={{ color: colors.text, fontWeight: "600" }}>{t(language, "cancel")}</Text>
              </Pressable>
              <Pressable onPress={handleReset} style={[styles.btn, { backgroundColor: colors.destructive }]}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>{t(language, "reset")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingBottom: 14, borderBottomWidth: 1 },
  logo: { width: 44, height: 44, borderRadius: 12, borderWidth: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 12 },
  scroll: { padding: 18, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 12, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  rowSub: { fontSize: 12, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: "center" },
  toggleThumb: { position: "absolute", width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", top: 2 },
  pinModal: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  closeBtn: { position: "absolute", top: 24, right: 24 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  resetCard: { borderRadius: 20, padding: 24, gap: 14, borderWidth: 1 },
  resetTitle: { fontSize: 20, fontWeight: "700" },
  resetHint: { fontSize: 14, lineHeight: 20 },
  resetInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, letterSpacing: 2 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
});
