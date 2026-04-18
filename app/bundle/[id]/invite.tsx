import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '../../../constants/colors';
import ModalHeader from '../../../components/ModalHeader';

const CURRENT_MEMBERS = [
  { id: '1', name: 'You', email: 'you@example.com', initial: 'Y', color: colors.primary.main, role: 'owner' },
  { id: '2', name: 'Sarah', email: 'sarah@example.com', initial: 'S', color: colors.secondary.purple, role: 'member' },
  { id: '3', name: 'James', email: 'james@example.com', initial: 'J', color: colors.secondary.mint, role: 'member' },
];

export default function InviteScreen() {
  const { id } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const handleInvite = () => {
    if (!email.trim()) return;
    // TODO: send invite via Supabase
    setInviteSent(true);
    setEmail('');
    setTimeout(() => setInviteSent(false), 3000);
  };

  const handleShareLink = async () => {
    await Share.share({
      message: `Join my bundle on Bundly! bundly://bundle/${id}`,
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <ModalHeader title="Invite People" />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Share link */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Link</Text>
          <TouchableOpacity style={styles.shareCard} onPress={handleShareLink}>
            <View style={styles.shareIcon}>
              <Ionicons name="link-outline" size={22} color={colors.primary.dark} />
            </View>
            <View style={styles.shareInfo}>
              <Text style={styles.shareTitle}>Share invite link</Text>
              <Text style={styles.shareDesc}>Anyone with the link can join</Text>
            </View>
            <Ionicons name="share-outline" size={20} color={colors.primary.dark} />
          </TouchableOpacity>
        </View>

        {/* Invite by email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite by Email</Text>
          <View style={styles.emailRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="friend@example.com"
              placeholderTextColor={colors.text.disabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.emailInput}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !email.trim() && styles.sendBtnDisabled]}
              onPress={handleInvite}
              disabled={!email.trim()}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>

          {inviteSent && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success.text} />
              <Text style={styles.successText}>Invite sent!</Text>
            </View>
          )}
        </View>

        {/* Current members */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Members ({CURRENT_MEMBERS.length})</Text>
          <View style={styles.membersList}>
            {CURRENT_MEMBERS.map((member, i) => (
              <View
                key={member.id}
                style={[
                  styles.memberRow,
                  i < CURRENT_MEMBERS.length - 1 && styles.memberBorder,
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: member.color + '33' }]}>
                  <Text style={[styles.avatarText, { color: member.color }]}>
                    {member.initial}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
                <View style={[
                  styles.roleBadge,
                  member.role === 'owner' && styles.roleBadgeOwner,
                ]}>
                  <Text style={[
                    styles.roleText,
                    member.role === 'owner' && styles.roleTextOwner,
                  ]}>
                    {member.role === 'owner' ? 'Owner' : 'Member'}
                  </Text>
                </View>
                {member.role !== 'owner' && (
                  <TouchableOpacity style={styles.removeBtn}>
                    <Ionicons name="remove-circle-outline" size={20} color={colors.error.text} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
  scroll: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.disabled,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  shareIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary.main + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareInfo: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  shareDesc: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  emailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  emailInput: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text.primary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  sendBtn: {
    backgroundColor: colors.primary.dark,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.contrast,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: colors.success.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  successText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success.text,
  },
  membersList: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.background.border,
    overflow: 'hidden',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  memberBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 1,
  },
  memberEmail: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.background.border,
  },
  roleBadgeOwner: {
    backgroundColor: colors.primary.main + '22',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  roleTextOwner: {
    color: colors.primary.dark,
  },
  removeBtn: {
    padding: 4,
  },
});
