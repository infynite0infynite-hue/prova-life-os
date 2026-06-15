import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");
const NUM_STARS = 60;

function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const opacity = useRef(new Animated.Value(Math.random())).current;
  const colors = useColors();

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: Math.random() * 0.8 + 0.2,
          duration: 1500 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: Math.random() * 0.3,
          duration: 1500 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ]).start(animate);
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.star,
          opacity,
        },
      ]}
    />
  );
}

const stars = Array.from({ length: NUM_STARS }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 2.5 + 0.5,
  delay: Math.random() * 3000,
}));

export function StarField() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s) => (
        <Star key={s.id} x={s.x} y={s.y} size={s.size} delay={s.delay} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: { position: "absolute" },
});
