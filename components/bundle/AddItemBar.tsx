import React, { RefObject } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import ProductSuggestions from '../ProductSuggestions';
import type { ProductSearchResult } from '../../hooks/useProductSearch';

type Props = {
  inputRef: RefObject<TextInput>;
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  onLayout: (height: number) => void;
  suggestions: ProductSearchResult[];
  suggestionsLoading: boolean;
  selectedBarcode: string | null;
  onSuggestionSelect: (name: string, barcode: string) => void;
};

export default function AddItemBar({
  inputRef, value, onChange, onSubmit, onClose, onLayout,
  suggestions, suggestionsLoading, selectedBarcode, onSuggestionSelect,
}: Props) {
  return (
    <View style={styles.overlay} onLayout={(e) => onLayout(e.nativeEvent.layout.height)}>
      <View style={styles.bar}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          placeholder="Item name..."
          placeholderTextColor={colors.text.disabled}
          style={styles.input}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <TouchableOpacity onPress={onSubmit} style={styles.confirm}>
          <Ionicons name="checkmark" size={20} color={colors.primary.contrast} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.cancel}>
          <Ionicons name="close" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
      <ProductSuggestions
        suggestions={suggestions}
        onSelect={onSuggestionSelect}
        selectedBarcode={selectedBarcode}
        isLoading={suggestionsLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.background.border,
    borderRadius: 14,
    marginTop: 24,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: 8,
  },
  confirm: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
