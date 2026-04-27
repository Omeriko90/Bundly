import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../../constants/colors';
import type { BundleMemberEntry } from '../../queries/members';

type Props = {
  checkedCount: number;
  totalCount: number;
  members: BundleMemberEntry[];
  bundleId: string;
};

export default function BundleProgress({ checkedCount, totalCount, members, bundleId }: Props) {
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          {checkedCount} of {totalCount} completed
        </Text>
        <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` as any }]} />
      </View>
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
          onPress={() => router.push(`/bundle/${bundleId}/invite`)}
        >
          <Ionicons name="add" size={14} color={colors.primary.dark} />
        </TouchableOpacity>
        <Text style={styles.membersLabel}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
