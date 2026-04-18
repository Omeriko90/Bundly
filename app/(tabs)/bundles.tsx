import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';

const BUNDLES = [
  {
    id: '1',
    name: 'Holiday Wishlist',
    description: 'Things I want this holiday season',
    items: 12,
    checkedItems: 3,
    members: [
      { initial: 'S', color: colors.secondary.purple },
      { initial: 'J', color: colors.secondary.mint },
      { initial: 'M', color: colors.secondary.peach },
    ],
    color: colors.secondary.purple,
    isOwner: true,
  },
  {
    id: '2',
    name: 'Europe Trip',
    description: 'Packing list and to-dos for our trip',
    items: 8,
    checkedItems: 5,
    members: [
      { initial: 'J', color: colors.secondary.mint },
      { initial: 'M', color: colors.secondary.peach },
      { initial: 'Y', color: colors.primary.main },
      { initial: 'L', color: colors.secondary.purple },
    ],
    color: colors.secondary.mint,
    isOwner: false,
  },
  {
    id: '3',
    name: 'Grocery Run',
    description: 'Weekly groceries',
    items: 6,
    checkedItems: 0,
    members: [
      { initial: 'Y', color: colors.primary.main },
    ],
    color: colors.secondary.peach,
    isOwner: true,
  },
  {
    id: '4',
    name: 'Home Renovation',
    description: 'Items to buy for the new place',
    items: 20,
    checkedItems: 9,
    members: [
      { initial: 'Y', color: colors.primary.main },
      { initial: 'S', color: colors.secondary.purple },
    ],
    color: colors.primary.light,
    isOwner: true,
  },
];

export default function BundlesScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine' | 'shared'>('all');

  const filtered = BUNDLES.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'mine' && b.isOwner) ||
      (filter === 'shared' && !b.isOwner);
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Bundles</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/bundle/create')}
        >
          <Ionicons name="add" size={20} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={colors.text.disabled} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search bundles..."
            placeholderTextColor={colors.text.disabled}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'mine', 'shared'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.map((bundle) => {
          const progress = bundle.items > 0 ? bundle.checkedItems / bundle.items : 0;
          return (
            <TouchableOpacity
              key={bundle.id}
              style={styles.card}
              onPress={() => router.push(`/bundle/${bundle.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <View style={[styles.colorDot, { backgroundColor: bundle.color }]} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{bundle.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={1}>{bundle.description}</Text>
                </View>
                {!bundle.isOwner && (
                  <View style={styles.sharedBadge}>
                    <Text style={styles.sharedBadgeText}>Shared</Text>
                  </View>
                )}
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.cardMeta}>
                  {bundle.checkedItems}/{bundle.items} items
                </Text>
                <View style={styles.members}>
                  {bundle.members.slice(0, 3).map((m, i) => (
                    <View
                      key={i}
                      style={[
                        styles.memberAvatar,
                        { backgroundColor: m.color + '33', marginLeft: i > 0 ? -8 : 0 },
                      ]}
                    >
                      <Text style={[styles.memberInitial, { color: m.color }]}>{m.initial}</Text>
                    </View>
                  ))}
                  {bundle.members.length > 3 && (
                    <View style={[styles.memberAvatar, styles.memberMore, { marginLeft: -8 }]}>
                      <Text style={styles.memberMoreText}>+{bundle.members.length - 3}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="layers-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyText}>No bundles found</Text>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
  },
  newBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.dark,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.primary.contrast,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  sharedBadge: {
    backgroundColor: colors.info.bg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sharedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.info.text,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.ui.progressBar.background,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    backgroundColor: colors.ui.progressBar.fill,
    borderRadius: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    fontSize: 12,
    color: colors.text.disabled,
    fontWeight: '600',
  },
  members: {
    flexDirection: 'row',
    alignItems: 'center',
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
  memberMore: {
    backgroundColor: colors.background.border,
  },
  memberMoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.disabled,
    fontWeight: '600',
  },
});
