import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppContext } from "@/context/AppContext";
import { PinPad } from "@/components/PinPad";
import { StarField } from "@/components/StarField";
import { useColors } from "@/hooks/useColors";
import { t } from "@/lib/i18n";
import { Modal, Pressable } from "react-native";

export default function LockScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { verifyAppPasscode, setIsLocked, language, resetAllPasscodes } = useAppContext();
  const [pinError, setPinError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetError, setResetError] = useState("");

  const handleComplete = (code: string) => {
    if (verifyAppPasscode(code)) {
      setIsLocked(false);
      router.replace("/(tabs)/");
    } else {
      setPinError(t(language, "wrongPasscode"));
      setTimeout(() => setPinError(""), 1500);
    }
  };

  const handleReset = async () => {
    if (resetInput.trim() === "MYLIFEPROVASIX") {
      await resetAllPasscodes();
      setShowReset(false);
      setResetInput("");
      router.replace("/(tabs)/");
    } else {
      setResetError(t(language, "typeToReset"));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StarField />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: colors.primary }]}>
          {t(language, "appName")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {t(language, "enterPasscode")}
        </Text>

        <View style={styles.pinWrap}>
          <PinPad
            onComplete={handleComplete}
            onForgot={() => setShowReset(true)}
            error={pinError}
            forgotLabel={t(language, "forgotPasscode")}
          />
        </View>
      </View>

      <Modal visible={showReset} transparent animationType="slide" onRequestClose={() => setShowReset(false)}>
        <View style={styles.overlay}>
          <View style={[styles.resetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.resetTitle, { color: colors.text }]}>
              {t(language, "forgotPasscode")}
            </Text>
            <Text style={[styles.resetHint, { color: colors.mutedForeground }]}>
              {t(language, "resetHint")}
            </Text>
            <TextInput
              value={resetInput}
              onChangeText={(v) => { setResetInput(v); setResetError(""); }}
              placeholder="MYLIFEPROVASIX"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="characters"
              style={[styles.resetInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
            />
            {resetError ? <Text style={{ color: colors.destructive, fontSize: 13 }}>{resetError}</Text> : null}
            <View style={styles.resetBtns}>
              <Pressable
                onPress={() => { setShowReset(false); setResetInput(""); setResetError(""); }}
                style={[styles.btn, { backgroundColor: colors.secondary }]}
              >
                <Text style={{ color: colors.text, fontWeight: "600" }}>{t(language, "cancel")}</Text>
              </Pressable>
              <Pressable onPress={handleReset} style={[styles.btn, { backgroundColor: colors.primary }]}>
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
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 8 },
  appName: { fontSize: 28, fontWeight: "800", letterSpacing: 2 },
  subtitle: { fontSize: 15, marginBottom: 8 },
  pinWrap: { marginTop: 8, width: "100%" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
  resetCard: { borderRadius: 20, padding: 24, gap: 14, borderWidth: 1 },
  resetTitle: { fontSize: 20, fontWeight: "700" },
  resetHint: { fontSize: 14, lineHeight: 20 },
  resetInput: { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 15, letterSpacing: 2 },
  resetBtns: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, padding: 14, borderRadius: 12, alignItems: "center" },
});
