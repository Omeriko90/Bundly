import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../constants/colors';
import ConfettiBurst from '../../components/ConfettiBurst';
import AddItemToast from '../../components/AddItemToast';
import BundleHeader from '../../components/bundle/BundleHeader';
import BundleProgress from '../../components/bundle/BundleProgress';
import BundleItemList from '../../components/bundle/BundleItemList';
import AddItemBar from '../../components/bundle/AddItemBar';
import BundleBottomBar from '../../components/bundle/BundleBottomBar';
import SearchingModal from '../../components/bundle/SearchingModal';
import { usePriceFinder } from '../../hooks/usePriceFinder';
import { useBundle } from '../../hooks/useBundle';
import { useBundleItems } from '../../hooks/useBundleItems';
import { useMembers } from '../../hooks/useMembers';
import { useProductSearch } from '../../hooks/useProductSearch';

export default function BundleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newItem, setNewItem] = useState('');
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [overlayHeight, setOverlayHeight] = useState(0);
  const [toast, setToast] = useState<{
    visible: boolean;
    type: 'added' | 'duplicate';
    itemId: string | null;
    itemText: string;
  }>({ visible: false, type: 'added', itemId: null, itemText: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [confetti, setConfetti] = useState({ trigger: false, x: 0, y: 0 });

  const { status: priceStatus, search: searchPrices } = usePriceFinder();
  const isSearching = priceStatus === 'requesting_location' || priceStatus === 'searching';

  const { data: bundle, isLoading: bundleLoading } = useBundle(id!);
  const { items, isLoading: itemsLoading, toggleItem, addItem, deleteItem } = useBundleItems(id!);
  const { data: members = [] } = useMembers(id!);
  const { results: suggestions, isLoading: suggestionsLoading } = useProductSearch(showAddItem ? newItem : '');

  const isLoading = bundleLoading || itemsLoading;
  const isDuplicate = toast.type === 'duplicate';
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  const handleComplete = (x: number, y: number) => {
    setConfetti({ trigger: false, x, y });
    setTimeout(() => setConfetti({ trigger: true, x, y }), 10);
  };

  const showAddedToast = (itemId: string, itemText: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, type: 'added', itemId, itemText });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const showDuplicateToast = (itemId: string, itemText: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, type: 'duplicate', itemId, itemText });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleUndo = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast((t) => ({ ...t, visible: false }));
    if (toast.itemId) deleteItem.mutate(toast.itemId);
  };

  const findDuplicate = (text: string, barcode?: string | null) =>
    items.find((i) =>
      (barcode && i.barcode === barcode) ||
      i.text.toLowerCase() === text.toLowerCase()
    );

  const handleNewItemChange = (text: string) => {
    setNewItem(text);
    if (selectedBarcode) setSelectedBarcode(null);
  };

  const handleSuggestionSelect = (name: string, barcode: string) => {
    setNewItem('');
    setSelectedBarcode(null);
    const dup = findDuplicate(name, barcode);
    if (dup) { showDuplicateToast(dup.id, dup.text); return; }
    addItem.mutate({ text: name, barcode }, {
      onSuccess: (inserted) => {
        inputRef.current?.focus();
        showAddedToast(inserted.id, name);
      },
    });
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const text = newItem.trim();
    const dup = findDuplicate(text, selectedBarcode);
    if (dup) { showDuplicateToast(dup.id, dup.text); return; }
    addItem.mutate({ text, barcode: selectedBarcode }, {
      onSuccess: (inserted) => {
        setNewItem('');
        setSelectedBarcode(null);
        inputRef.current?.focus();
        showAddedToast(inserted.id, text);
      },
    });
  };

  const handleDeleteItem = (itemId: string) => {
    Alert.alert('Delete Item', 'Remove this item from the bundle?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem.mutate(itemId) },
    ]);
  };

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

      <BundleHeader bundleName={bundle?.name ?? ''} bundleId={id!} />

      <BundleProgress
        checkedCount={checked.length}
        totalCount={items.length}
        members={members}
        bundleId={id!}
      />

      <View style={{ flex: 1 }}>
        <BundleItemList
          unchecked={unchecked}
          checked={checked}
          paddingTop={showAddItem ? overlayHeight + 8 : 16}
          onToggle={(itemId) => toggleItem.mutate(itemId)}
          onDelete={handleDeleteItem}
          onComplete={handleComplete}
        />

        {showAddItem && (
          <AddItemBar
            inputRef={inputRef}
            value={newItem}
            onChange={handleNewItemChange}
            onSubmit={handleAddItem}
            onClose={() => { setNewItem(''); setSelectedBarcode(null); setShowAddItem(false); }}
            onLayout={setOverlayHeight}
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            selectedBarcode={selectedBarcode}
            onSuggestionSelect={handleSuggestionSelect}
          />
        )}
      </View>

      {!showAddItem && (
        <BundleBottomBar
          hasItems={items.length > 0}
          isSearching={isSearching}
          onSearch={() => searchPrices(items.map((i) => i.text), id as string)}
          onAdd={() => setShowAddItem(true)}
        />
      )}

      <SearchingModal visible={isSearching} />

      {toast.visible && (
        <AddItemToast
          visible
          prefix={isDuplicate ? 'Already in list:' : 'Added'}
          itemText={toast.itemText}
          actionLabel={isDuplicate ? undefined : 'Undo'}
          onAction={isDuplicate ? undefined : handleUndo}
        />
      )}

      <ConfettiBurst trigger={confetti.trigger} x={confetti.x} y={confetti.y} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
