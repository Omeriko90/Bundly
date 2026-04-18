import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';

const ACTIVITY = [
  {
    id: '1',
    user: 'Sarah',
    action: 'added',
    item: 'AirPods Pro',
    bundle: 'Holiday Wishlist',
    time: '2m ago',
    avatar: 'S',
    avatarColor: colors.secondary.purple,
  },
  {
    id: '2',
    user: 'James',
    action: 'checked off',
    item: 'Book flights',
    bundle: 'Europe Trip',
    time: '15m ago',
    avatar: 'J',
    avatarColor: colors.secondary.mint,
  },
  {
    id: '3',
    user: 'You',
    action: 'created bundle',
    item: '',
    bundle: 'Grocery Run',
    time: '1h ago',
    avatar: 'Y',
    avatarColor: colors.primary.main,
  },
  {
    id: '4',
    user: 'Mia',
    action: 'joined',
    item: '',
    bundle: 'Europe Trip',
    time: '3h ago',
    avatar: 'M',
    avatarColor: colors.secondary.peach,
  },
  {
    id: '5',
    user: 'James',
    action: 'added',
    item: 'Sunscreen SPF 50',
    bundle: 'Europe Trip',
    time: '5h ago',
    avatar: 'J',
    avatarColor: colors.secondary.mint,
  },
];

const PINNED = [
  { id: '1', name: 'Holiday Wishlist', items: 12, members: 3, color: colors.secondary.purple },
  { id: '2', name: 'Europe Trip', items: 8, members: 4, color: colors.secondary.mint },
];

export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.subtitle}>Here's what's happening</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/bundle/create')}
        >
          <Ionicons name="add" size={20} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Pinned bundles */}
        <Text style={styles.sectionTitle}>Pinned Bundles</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pinnedRow}>
          {PINNED.map((bundle) => (
            <TouchableOpacity
              key={bundle.id}
              style={[styles.pinnedCard, { backgroundColor: bundle.color + '33' }]}
              onPress={() => router.push(`/bundle/${bundle.id}`)}
            >
              <View style={[styles.pinnedDot, { backgroundColor: bundle.color }]} />
              <Text style={styles.pinnedName}>{bundle.name}</Text>
              <Text style={styles.pinnedMeta}>
                {bundle.items} items · {bundle.members} members
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Activity feed */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.feed}>
          {ACTIVITY.map((a) => (
            <View key={a.id} style={styles.activityItem}>
              <View style={[styles.avatar, { backgroundColor: a.avatarColor + '33' }]}>
                <Text style={[styles.avatarText, { color: a.avatarColor }]}>{a.avatar}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityUser}>{a.user}</Text>
                  {' '}{a.action}{a.item ? ' ' : ''}
                  {a.item ? <Text style={styles.activityItem2}>"{a.item}"</Text> : null}
                  {' '}in{' '}
                  <Text style={styles.activityBundle}>{a.bundle}</Text>
                </Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            </View>
          ))}
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
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  newBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.secondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  pinnedRow: {
    paddingLeft: 24,
  },
  pinnedCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  pinnedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pinnedName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  pinnedMeta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  feed: {
    paddingHorizontal: 24,
    gap: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: '700',
  },
  activityItem2: {
    fontStyle: 'italic',
  },
  activityBundle: {
    color: colors.primary.dark,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: colors.text.disabled,
  },
});
