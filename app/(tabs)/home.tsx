import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import { usePinnedBundles } from '../../hooks/usePinnedBundles';
import { useActivityFeed } from '../../hooks/useActivityFeed';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning 👋';
  if (hour < 18) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function HomeScreen() {
  const { data: pinned = [], isLoading: pinnedLoading } = usePinnedBundles();
  const { data: activity = [], isLoading: activityLoading } = useActivityFeed();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
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
        {pinnedLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary.dark} />
          </View>
        ) : pinned.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pinnedRow}>
            {pinned.map((bundle) => (
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
        ) : (
          <Text style={styles.emptyHint}>Pin a bundle to see it here</Text>
        )}

        {/* Activity feed */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {activityLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.primary.dark} />
          </View>
        ) : activity.length > 0 ? (
          <View style={styles.feed}>
            {activity.map((a) => (
              <View key={a.id} style={styles.activityItem}>
                <View style={[styles.avatar, { backgroundColor: a.avatarColor + '33' }]}>
                  <Text style={[styles.avatarText, { color: a.avatarColor }]}>
                    {a.displayName[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{a.text}</Text>
                  <Text style={styles.activityTime}>{timeAgo(a.createdAt)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyHint}>No recent activity</Text>
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
  loadingRow: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  emptyHint: {
    paddingHorizontal: 24,
    fontSize: 13,
    color: colors.text.disabled,
    marginBottom: 8,
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
  activityTime: {
    fontSize: 12,
    color: colors.text.disabled,
  },
});
