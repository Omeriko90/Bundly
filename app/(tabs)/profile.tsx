import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors } from '../../constants/colors';

const STATS = [
  { label: 'Bundles', value: '4' },
  { label: 'Items', value: '46' },
  { label: 'Completed', value: '17' },
];

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
      { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
      { icon: 'lock-closed-outline', label: 'Privacy & Security', onPress: () => {} },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'color-palette-outline', label: 'Appearance', onPress: () => {} },
      { icon: 'language-outline', label: 'Language', onPress: () => {} },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', onPress: () => {} },
      { icon: 'mail-outline', label: 'Contact Us', onPress: () => {} },
      { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => {} },
    ],
  },
];

export default function ProfileScreen() {
  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar & name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>Y</Text>
          </View>
          <Text style={styles.name}>Your Name</Text>
          <Text style={styles.email}>you@example.com</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={s.label} style={[styles.statItem, i < STATS.length - 1 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.menuItem, i < section.items.length - 1 && styles.menuBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.icon as any} size={20} color={colors.text.secondary} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.disabled} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={colors.error.text} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Bundly v1.0.0</Text>
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
  scroll: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: colors.background.card,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main + '33',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary.dark,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  editProfileBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary.dark,
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary.dark,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.background.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.disabled,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.background.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.background.border,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.error.bg,
    borderWidth: 1,
    borderColor: colors.error.border,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error.text,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.text.disabled,
  },
});
