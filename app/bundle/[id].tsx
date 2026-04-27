import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/colors';
import ItemRow from '../../components/ItemRow';
import ConfettiBurst from '../../components/ConfettiBurst';
import { usePriceFinder } from '../../hooks/usePriceFinder';
import { useBundle } from '../../hooks/useBundle';
import { useBundleItems } from '../../hooks/useBundleItems';
import { useMembers } from '../../hooks/useMembers';
import { useProductSearch } from '../../hooks/useProductSearch';
import ProductSuggestions from '../../components/ProductSuggestions';
import AddItemToast from '../../components/AddItemToast';

export default function BundleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newItem, setNewItem] = useState('');
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const [toast, setToast] = useState<{ visible: boolean; itemId: string | null; itemText: string }>({
    visible: false, itemId: null, itemText: '',
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const { results: suggestions, isLoading: suggestionsLoading } = useProductSearch(showAddItem ? newItem : '');
  const [confetti, setConfetti] = useState({ trigger: false, x: 0, y: 0 });
  const { status: priceStatus, search: searchPrices } = usePriceFinder();
  const isSearching = priceStatus === 'requesting_location' || priceStatus === 'searching';

  const { data: bundle, isLoading: bundleLoading } = useBundle(id!);
  const { items, isLoading: itemsLoading, toggleItem, addItem, deleteItem } = useBundleItems(id!);
  const { data: members = [] } = useMembers(id!);
  const isLoading = bundleLoading || itemsLoading;

  const handleComplete = (x: number, y: number) => {
    setConfetti({ trigger: false, x, y });
    setTimeout(() => setConfetti({ trigger: true, x, y }), 10);
  };

  const handleToggle = (itemId: string) => {
    toggleItem.mutate(itemId);
  };

  const handleNewItemChange = (text: string) => {
    setNewItem(text);
    if (selectedBarcode) setSelectedBarcode(null);
  };

  const showToast = (itemId: string, itemText: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, itemId, itemText });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleUndo = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast((t) => ({ ...t, visible: false }));
    if (toast.itemId) deleteItem.mutate(toast.itemId);
  };

  const handleSuggestionSelect = (name: string, barcode: string) => {
    setNewItem('');
    setSelectedBarcode(null);
    addItem.mutate({ text: name, barcode }, {
      onSuccess: (inserted) => {
        inputRef.current?.focus();
        showToast(inserted.id, name);
      },
    });
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const text = newItem.trim();
    addItem.mutate({ text, barcode: selectedBarcode }, {
      onSuccess: (inserted) => {
        setNewItem('');
        setSelectedBarcode(null);
        inputRef.current?.focus();
        showToast(inserted.id, text);
      },
    });
  };

  const closeAddItem = () => {
    setNewItem('');
    setSelectedBarcode(null);
    setShowAddItem(false);
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Remove this item from the bundle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteItem.mutate(itemId),
      },
    ]);
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);
  const progress = items.length > 0 ? checked.length / items.length : 0;

  if (isLoading) {
    return (
      <View style={[styles.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary.dark} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{bundle?.name ?? ''}</Text>
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
          {members.map((m, i) => (
            <View
              key={m.userId}
              style={[
                styles.memberAvatar,
                { backgroundColor: m.avatarColor + '33', marginLeft: i > 0 ? -8 : 0 },
              ]}
            >
              <Text style={[styles.memberInitial, { color: m.avatarColor }]}>
                {m.displayName[0].toUpperCase()}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addMemberBtn}
            onPress={() => router.push(`/bundle/${id}/invite`)}
          >
            <Ionicons name="add" size={14} color={colors.primary.dark} />
          </TouchableOpacity>
          <Text style={styles.membersLabel}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* List + floating add-item overlay */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, showAddItem && { paddingTop: overlayHeight + 8 }]}
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
                onToggle={() => handleToggle(item.id)}
                onDelete={() => handleDeleteItem(item.id)}
                onComplete={handleComplete}
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
                onToggle={() => handleToggle(item.id)}
                onDelete={() => handleDeleteItem(item.id)}
                onComplete={handleComplete}
              />
            ))}
          </>
        )}
        </ScrollView>

        {/* Floating add-item input + dropdown */}
        {showAddItem && (
          <View style={styles.addBarOverlay} onLayout={(e) => setOverlayHeight(e.nativeEvent.layout.height)}>
            <View style={styles.addBar}>
              <TextInput
                ref={inputRef}
                value={newItem}
                onChangeText={handleNewItemChange}
                placeholder="Item name..."
                placeholderTextColor={colors.text.disabled}
                style={styles.addBarInput}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddItem}
              />
              <TouchableOpacity onPress={handleAddItem} style={styles.addBarConfirm}>
                <Ionicons name="checkmark" size={20} color={colors.primary.contrast} />
              </TouchableOpacity>
              <TouchableOpacity onPress={closeAddItem} style={styles.addBarCancel}>
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ProductSuggestions suggestions={suggestions} onSelect={handleSuggestionSelect} selectedBarcode={selectedBarcode} isLoading={suggestionsLoading} />
          </View>
        )}
      </View>

      {/* Bottom action row — only when not adding an item */}
      {!showAddItem && (
        <View style={styles.bottomRow}>
          <View style={styles.bottomLeft}>
            {items.length > 0 && (
              <TouchableOpacity
                style={styles.cheapestBtn}
                onPress={() => searchPrices(items.map((i) => i.text), id as string)}
                activeOpacity={0.85}
                disabled={isSearching}
              >
                <Ionicons name="storefront-outline" size={16} color={colors.primary.dark} />
                <Text style={styles.cheapestBtnText}>חנות הכי זולה</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowAddItem(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={28} color={colors.primary.contrast} />
          </TouchableOpacity>
        </View>
      )}

      {/* Searching overlay */}
      <Modal transparent visible={isSearching} animationType="fade">
        <View style={styles.searchingOverlay}>
          <View style={styles.searchingCard}>
            <ActivityIndicator size="large" color={colors.primary.dark} />
            <Text style={styles.searchingText}>מחפש מחירים...</Text>
          </View>
        </View>
      </Modal>



      <AddItemToast visible={toast.visible} itemText={toast.itemText} onUndo={handleUndo} />
      <ConfettiBurst trigger={confetti.trigger} x={confetti.x} y={confetti.y} />
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
  searchingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingCard: {
    backgroundColor: colors.background.card,
    borderRadius: 20,
    paddingHorizontal: 36,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  searchingText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  addBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  addBar: {
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
