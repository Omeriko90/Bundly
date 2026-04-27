import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

type Props = {
  hasItems: boolean;
  isSearching: boolean;
  onSearch: () => void;
  onAdd: () => void;
};

export default function BundleBottomBar({ hasItems, isSearching, onSearch, onAdd }: Props) {
  return (
    <View style={styles.bottomRow}>
      <View style={styles.bottomLeft}>
        {hasItems && (
          <TouchableOpacity
            style={styles.cheapestBtn}
            onPress={onSearch}
            activeOpacity={0.85}
            disabled={isSearching}
          >
            <Ionicons name="storefront-outline" size={16} color={colors.primary.dark} />
            <Text style={styles.cheapestBtnText}>חנות הכי זולה</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.fab} onPress={onAdd} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={colors.primary.contrast} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomLeft: {
    flex: 1,
  },
  cheapestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.primary.main,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cheapestBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.dark,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
