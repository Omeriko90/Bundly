import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import ModalHeader from '../../components/ModalHeader';

const COLOR_OPTIONS = [
  colors.secondary.purple,
  colors.secondary.mint,
  colors.secondary.peach,
  colors.primary.light,
  colors.primary.main,
];

const ICON_OPTIONS = [
  'list-outline',
  'gift-outline',
  'cart-outline',
  'airplane-outline',
  'home-outline',
  'restaurant-outline',
  'film-outline',
  'book-outline',
  'fitness-outline',
  'heart-outline',
];

export default function CreateBundleScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [isPublic, setIsPublic] = useState(false);

  const canCreate = name.trim().length > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    // TODO: create bundle in Supabase
    router.back();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ModalHeader
        title="New Bundle"
        right={
          <TouchableOpacity
            style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!canCreate}
          >
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView  keyboardShouldPersistTaps="handled">
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: selectedColor + '22' }]}>
          <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
            <Ionicons name={selectedIcon as any} size={28} color="#fff" />
          </View>
          <Text style={styles.previewName}>{name || 'Bundle Name'}</Text>
          {description ? (
            <Text style={styles.previewDesc}>{description}</Text>
          ) : null}
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>BUNDLE NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Holiday Wishlist"
            placeholderTextColor={colors.text.disabled}
            style={styles.input}
            autoFocus
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is this bundle for?"
            placeholderTextColor={colors.text.disabled}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
        </View>

        {/* Color */}
        <View style={styles.field}>
          <Text style={styles.label}>COLOR</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  selectedColor === c && styles.colorDotSelected,
                ]}
                onPress={() => setSelectedColor(c)}
              >
                {selectedColor === c && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Icon */}
        <View style={styles.field}>
          <Text style={styles.label}>ICON</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconOption,
                  selectedIcon === icon && {
                    backgroundColor: selectedColor,
                    borderColor: selectedColor,
                  },
                ]}
                onPress={() => setSelectedIcon(icon)}
              >
                <Ionicons
                  name={icon as any}
                  size={22}
                  color={selectedIcon === icon ? '#fff' : colors.text.secondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibility */}
        <View style={styles.field}>
          <Text style={styles.label}>VISIBILITY</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>{isPublic ? 'Public' : 'Private'}</Text>
              <Text style={styles.toggleDesc}>
                {isPublic
                  ? 'Anyone can discover and request to join'
                  : 'Only invited members can see this bundle'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isPublic && styles.toggleOn]}
              onPress={() => setIsPublic((p) => !p)}
            >
              <View style={[styles.toggleKnob, isPublic && styles.toggleKnobOn]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  createBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.primary.dark,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.contrast,
  },
  
  preview: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 8,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  field: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.disabled,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: colors.text.primary,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderWidth: 1.5,
    borderColor: colors.background.border,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.background.border,
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  toggleDesc: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background.border,
    padding: 3,
  },
  toggleOn: {
    backgroundColor: colors.primary.dark,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  toggleKnobOn: {
    marginLeft: 20,
  },
});
