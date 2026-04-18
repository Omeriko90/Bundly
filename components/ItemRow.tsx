import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

type Props = {
  item: { id: string; text: string; checked: boolean; addedBy: string };
  onToggle: () => void;
  onDelete: () => void;
  onComplete: (x: number, y: number) => void;
};

export default function ItemRow({ item, onToggle, onDelete, onComplete }: Props) {
  const checkboxRef = useRef<View>(null);

  const handleToggle = () => {
    if (!item.checked) {
      checkboxRef.current?.measureInWindow((x, y, width, height) => {
        onComplete(x + width / 2, y + height / 2);
      });
    }
    onToggle();
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
        <View ref={checkboxRef}>
          {item.checked ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary.dark} />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color={colors.text.disabled} />
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.text, item.checked && styles.textChecked]}>
          {item.text}
        </Text>
        <Text style={styles.meta}>Added by {item.addedBy}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={16} color={colors.text.disabled} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingRight: 12,
    marginBottom: 6,
    gap: 8,
  },
  checkbox: {
    padding: 12,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
  },
  text: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  textChecked: {
    textDecorationLine: 'line-through',
    color: colors.text.disabled,
  },
  meta: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  deleteBtn: {
    padding: 8,
  },
});
