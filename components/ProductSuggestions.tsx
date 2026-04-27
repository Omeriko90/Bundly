import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import type { ProductSearchResult } from '../hooks/useProductSearch';

type Props = {
  suggestions: ProductSearchResult[];
  onSelect: (name: string, barcode: string) => void;
  selectedBarcode?: string | null;
  isLoading?: boolean;
};

export default function ProductSuggestions({ suggestions, onSelect, selectedBarcode, isLoading }: Props) {
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary.dark} />
        </View>
      )}
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.barcode}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => {
          const isSelected = selectedBarcode === item.barcode;
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => onSelect(item.name, item.barcode)}
              activeOpacity={0.75}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="basket-outline" size={20} color={colors.primary.dark} />
              </View>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              {isSelected ? (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              ) : (
                <Ionicons name="arrow-up-outline" size={18} color={colors.text.disabled} />
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.background.border,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  list: {
    padding: 8,
  },
  separator: {
    height: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  cardSelected: {
    backgroundColor: colors.primary.main + '18',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary.main + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary.dark,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
