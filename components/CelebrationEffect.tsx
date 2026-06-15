import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");
const NUM_PARTICLES = 30;

const COLORS = ["#9333EA", "#C084FC", "#7C3AED", "#E9D5FF", "#F472B6", "#818CF8", "#34D399"];

function Particle({ delay }: { delay: number }) {
  const x = useRef(new Animated.Value(width / 2)).current;
  const y = useRef(new Animated.Value(height / 2)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  const targetX = width / 2 + (Math.random() - 0.5) * width * 1.2;
  const targetY = height / 2 + (Math.random() - 0.5) * height * 1.2;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const size = Math.random() * 8 + 4;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 5 }),
        Animated.timing(x, { toValue: targetX, duration: 900, useNativeDriver: true }),
        Animated.timing(y, { toValue: targetY, duration: 900, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [
            { translateX: Animated.subtract(x, new Animated.Value(size / 2)) },
            { translateY: Animated.subtract(y, new Animated.Value(size / 2)) },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
}

interface CelebrationEffectProps {
  visible: boolean;
  onDone: () => void;
}

export function CelebrationEffect({ visible, onDone }: CelebrationEffectProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDone, 1400);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} delay={i * 20} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: { position: "absolute", top: 0, left: 0 },
});
