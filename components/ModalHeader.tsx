import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../constants/colors';

type Props = {
  title: string;
  onClose?: () => void;
  right?: React.ReactNode;
};

export default function ModalHeader({ title, onClose, right }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onClose ?? (() => router.back())}
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={22} color={colors.text.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  right: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});
