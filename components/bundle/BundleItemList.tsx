import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import ItemRow from '../ItemRow';
import { colors } from '../../constants/colors';
import type { BundleDetailItem } from '../../queries/bundleItems';

type Props = {
  unchecked: BundleDetailItem[];
  checked: BundleDetailItem[];
  paddingTop: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onComplete: (x: number, y: number) => void;
};

export default function BundleItemList({ unchecked, checked, paddingTop, onToggle, onDelete, onComplete }: Props) {
  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingTop }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {unchecked.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>To Do</Text>
          {unchecked.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id)}
              onDelete={() => onDelete(item.id)}
              onComplete={onComplete}
            />
          ))}
        </>
      )}

      {checked.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
            Completed ({checked.length})
          </Text>
          {checked.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggle={() => onToggle(item.id)}
              onDelete={() => onDelete(item.id)}
              onComplete={onComplete}
            />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
});
