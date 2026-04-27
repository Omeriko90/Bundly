import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '../constants/colors';

type Props = {
  visible: boolean;
  itemText: string;
  onUndo: () => void;
};

export default function AddItemToast({ visible, itemText, onUndo }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 16, duration: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Text style={styles.text} numberOfLines={1}>
        Added <Text style={styles.bold}>{itemText}</Text>
      </Text>
      <View style={styles.divider} />
      <TouchableOpacity onPress={onUndo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.undo}>Undo</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  text: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  bold: {
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  undo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.light,
  },
});
