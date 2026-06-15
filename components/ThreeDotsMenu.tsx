import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export interface MenuOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: string;
}

interface ThreeDotsMenuProps {
  options: MenuOption[];
  size?: number;
}

export function ThreeDotsMenu({ options, size = 24 }: ThreeDotsMenuProps) {
  const [visible, setVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef<View>(null);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const openMenu = () => {
    btnRef.current?.measureInWindow((x, y, w, h) => {
      setMenuPos({ x: x - 160 + w, y: y + h + 4 });
      setVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    });
  };

  return (
    <>
      <Pressable ref={btnRef} onPress={openMenu} hitSlop={12} style={styles.btn}>
        <Text style={[styles.dots, { color: colors.mutedForeground, fontSize: size * 0.7 }]}>
          •••
        </Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.menu,
            {
              top: Math.min(menuPos.y, 600 - options.length * 50),
              left: Math.max(8, Math.min(menuPos.x, 200)),
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.primary,
            },
          ]}
        >
          {options.map((opt, i) => (
            <Pressable
              key={i}
              onPress={() => {
                setVisible(false);
                setTimeout(opt.onPress, 150);
              }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: pressed ? colors.secondary : "transparent",
                  borderBottomWidth: i < options.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: opt.destructive ? colors.destructive : colors.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 4, alignItems: "center", justifyContent: "center" },
  dots: { letterSpacing: 1 },
  menu: {
    position: "absolute",
    width: 200,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  option: { paddingHorizontal: 18, paddingVertical: 14 },
  optionText: { fontSize: 15, fontWeight: "500" },
});
