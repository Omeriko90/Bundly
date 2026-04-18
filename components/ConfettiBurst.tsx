import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

const CONFETTI_COLORS = colors.ui.confetti;
const PARTICLE_COUNT = 28;

function randomShape() {
  const shapes = [
    { width: 8, height: 8, borderRadius: 0 },
    { width: 5, height: 5, borderRadius: 3 },
    { width: 4, height: 10, borderRadius: 2 },
    { width: 10, height: 4, borderRadius: 2 },
  ];
  return shapes[Math.floor(Math.random() * shapes.length)];
}

type Particle = {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
  color: string;
  width: number;
  height: number;
  borderRadius: number;
};

type Props = {
  x: number;
  y: number;
  trigger: boolean;
};

export default function ConfettiBurst({ x, y, trigger }: Props) {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const shape = randomShape();
      return {
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(0),
        rotate: new Animated.Value(0),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        width: shape.width,
        height: shape.height,
        borderRadius: shape.borderRadius,
      };
    })
  ).current;

  useEffect(() => {
    if (!trigger) return;

    const animations = particles.map((p) => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 130 + 60;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      const gravityY = targetY + Math.random() * 80 + 40;

      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      p.rotate.setValue(0);

      return Animated.parallel([
        Animated.sequence([
          Animated.timing(p.x, { toValue: targetX, duration: 500, useNativeDriver: true }),
          Animated.timing(p.x, { toValue: targetX * 1.1, duration: 900, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(p.y, { toValue: targetY, duration: 500, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: gravityY, duration: 900, useNativeDriver: true }),
        ]),
        Animated.timing(p.rotate, {
          toValue: Math.random() * 10 - 5,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(900),
          Animated.timing(p.opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={[styles.origin, { left: x, top: y }]} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.width,
            height: p.height,
            borderRadius: p.borderRadius,
            backgroundColor: p.color,
            opacity: p.opacity,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
              {
                rotate: p.rotate.interpolate({
                  inputRange: [-5, 5],
                  outputRange: ['-450deg', '450deg'],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  origin: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
