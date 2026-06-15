import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface PinPadProps {
  onComplete: (code: string) => void;
  onForgot?: () => void;
  error?: string;
  label?: string;
  forgotLabel?: string;
}

const DIGITS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "⌫"],
];

export function PinPad({ onComplete, onForgot, error, label, forgotLabel }: PinPadProps) {
  const [pin, setPin] = useState("");
  const shake = useRef(new Animated.Value(0)).current;
  const colors = useColors();

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      setPin("");
    }
  }, [error]);

  const handlePress = (digit: string) => {
    if (digit === "") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (digit === "⌫") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => {
        onComplete(next);
        setPin("");
      }, 150);
    }
  };

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      ) : null}

      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shake }] }]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                borderColor: colors.primary,
                backgroundColor:
                  i < pin.length
                    ? colors.primary
                    : "transparent",
                shadowColor: i < pin.length ? colors.primary : "transparent",
                shadowOpacity: i < pin.length ? 0.9 : 0,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          />
        ))}
      </Animated.View>

      {error ? (
        <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
      ) : (
        <View style={{ height: 20 }} />
      )}

      <View style={styles.grid}>
        {DIGITS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((digit, di) => (
              <Pressable
                key={di}
                onPress={() => handlePress(digit)}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor:
                      digit === ""
                        ? "transparent"
                        : pressed
                        ? colors.primary
                        : colors.card,
                    borderColor: digit === "" ? "transparent" : colors.border,
                    shadowColor: colors.primary,
                    shadowOpacity: digit === "" ? 0 : 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                  },
                ]}
                disabled={digit === ""}
              >
                <Text
                  style={[
                    styles.keyText,
                    { color: digit === "⌫" ? colors.mutedForeground : colors.text },
                  ]}
                >
                  {digit}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {onForgot ? (
        <Pressable onPress={onForgot} style={styles.forgotBtn}>
          <Text style={[styles.forgotText, { color: colors.mutedForeground }]}>
            {forgotLabel ?? "Forgot Passcode?"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 16 },
  label: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  dotsRow: { flexDirection: "row", gap: 14, marginTop: 8 },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  error: { fontSize: 14, textAlign: "center" },
  grid: { gap: 12, marginTop: 8 },
  row: { flexDirection: "row", gap: 12 },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { fontSize: 24, fontWeight: "500" },
  forgotBtn: { marginTop: 8, padding: 12 },
  forgotText: { fontSize: 14 },
});
