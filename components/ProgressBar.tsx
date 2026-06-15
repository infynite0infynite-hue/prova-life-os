import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface ProgressBarProps {
  progress: number;
  height?: number;
  showLabel?: boolean;
  color?: string;
}

export function ProgressBar({ progress, height = 8, showLabel = false, color }: ProgressBarProps) {
  const colors = useColors();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: Math.max(0, Math.min(1, progress)),
      useNativeDriver: false,
      tension: 60,
      friction: 8,
    }).start();
  }, [progress]);

  const barColor = color ?? colors.primary;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.track,
          { height, borderRadius: height / 2, backgroundColor: colors.border },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: height / 2,
              backgroundColor: barColor,
              width: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              shadowColor: barColor,
              shadowOpacity: 0.6,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  track: { overflow: "hidden", flex: 1 },
  label: { fontSize: 12, textAlign: "right" },
});
