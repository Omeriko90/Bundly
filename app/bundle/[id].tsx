import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/colors';

const MOCK_BUNDLE = {
  id: '1',
  name: 'Holiday Wishlist',
  description: 'Things I want this holiday season',
  color: colors.secondary.purple,
  members: [
    { id: '1', initial: 'Y', name: 'You', color: colors.primary.main },
    { id: '2', initial: 'S', name: 'Sarah', color: colors.secondary.purple },
    { id: '3', initial: 'J', name: 'James', color: colors.secondary.mint },
  ],
  items: [
    { id: '1', text: 'AirPods Pro', checked: false, addedBy: 'Sarah' },
    { id: '2', text: 'Kindle Paperwhite', checked: false, addedBy: 'You' },
    { id: '3', text: 'Running shoes (Nike Pegasus)', checked: true, addedBy: 'You' },
    { id: '4', text: 'Cozy blanket', checked: false, addedBy: 'James' },
    { id: '5', text: 'Coffee subscription', checked: true, addedBy: 'Sarah' },
    { id: '6', text: 'Board game (Catan)', checked: false, addedBy: 'You' },
  ],
};

export default function BundleDetailScreen() {
  const { id } = useLocalSearchParams();
  const [items, setItems] = useState(MOCK_BUNDLE.items);
  const [newItem, setNewItem] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const toggleItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: newItem.trim(),
        checked: false,
        addedBy: 'You',
      },
    ]);
    setNewItem('');
    inputRef.current?.focus();
  };

  const closeAddItem = () => {
    setNewItem('');
    setShowAddItem(false);
  };

  const deleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Remove this item from the bundle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setItems((prev) => prev.filter((i) => i.id !== itemId)),
      },
    ]);
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const progress = items.length > 0 ? checked.length / items.length : 0;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{MOCK_BUNDLE.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.inviteBtn}
          onPress={() => router.push(`/bundle/${id}/invite`)}
        >
          <Ionicons name="person-add-outline" size={20} color={colors.primary.dark} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {checked.length} of {items.length} completed
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
        </View>

        {/* Members */}
        <View style={styles.membersRow}>
          {MOCK_BUNDLE.members.map((m, i) => (
            <View
              key={m.id}
              style={[
                styles.memberAvatar,
                { backgroundColor: m.color + '33', marginLeft: i > 0 ? -8 : 0 },
              ]}
            >
              <Text style={[styles.memberInitial, { color: m.color }]}>{m.initial}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addMemberBtn}
            onPress={() => router.push(`/bundle/${id}/invite`)}
          >
            <Ionicons name="add" size={14} color={colors.primary.dark} />
          </TouchableOpacity>
          <Text style={styles.membersLabel}>
            {MOCK_BUNDLE.members.length} member{MOCK_BUNDLE.members.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.scroll}
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
                onToggle={() => toggleItem(item.id)}
                onDelete={() => deleteItem(item.id)}
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
                onToggle={() => toggleItem(item.id)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Floating add button */}
      {!showAddItem && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddItem(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={colors.primary.contrast} />
        </TouchableOpacity>
      )}

      {/* Input bar — appears above keyboard when adding */}
      {showAddItem && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.addBar}>
            <TextInput
              ref={inputRef}
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Item name..."
              placeholderTextColor={colors.text.disabled}
              style={styles.addBarInput}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={addItem}
            />
            <TouchableOpacity onPress={addItem} style={styles.addBarConfirm}>
              <Ionicons name="checkmark" size={20} color={colors.primary.contrast} />
            </TouchableOpacity>
            <TouchableOpacity onPress={closeAddItem} style={styles.addBarCancel}>
              <Ionicons name="close" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function ItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: { id: string; text: string; checked: boolean; addedBy: string };
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={itemStyles.row}>
      <TouchableOpacity onPress={onToggle} style={itemStyles.checkbox}>
        {item.checked ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary.dark} />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color={colors.text.disabled} />
        )}
      </TouchableOpacity>
      <View style={itemStyles.content}>
        <Text style={[itemStyles.text, item.checked && itemStyles.textChecked]}>
          {item.text}
        </Text>
        <Text style={itemStyles.meta}>Added by {item.addedBy}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={itemStyles.deleteBtn}>
        <Ionicons name="trash-outline" size={16} color={colors.text.disabled} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  inviteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    backgroundColor: colors.background.card,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.dark,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.ui.progressBar.background,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    backgroundColor: colors.ui.progressBar.fill,
    borderRadius: 3,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.card,
  },
  memberInitial: {
    fontSize: 11,
    fontWeight: '700',
  },
  addMemberBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary.dark,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membersLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
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
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.background.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  addBarInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: 8,
  },
  addBarConfirm: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBarCancel: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.background.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const itemStyles = StyleSheet.create({
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
