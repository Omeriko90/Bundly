import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { colors } from '../constants/colors';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.session === null) {
      // Email confirmation is enabled — user must verify before logging in
      Alert.alert('Check your email', 'We sent a confirmation link to ' + email + '. Click it to activate your account.');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.logo}>Bundly</Text>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start your journey with Bundly today.</Text>

          <TouchableOpacity style={styles.googleBtn}>
            <Ionicons name="logo-google" size={18} color={colors.text.primary} />
            <Text style={styles.googleBtnText}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR USE EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="hello@example.com"
            placeholderTextColor={colors.text.disabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.disabled}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color={colors.text.disabled}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Must be at least 8 characters with one special symbol.
          </Text>

          <TouchableOpacity
            style={[styles.createBtn, loading && styles.createBtnDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.createBtnText}>
              {loading ? 'Creating...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Ionicons name="globe-outline" size={22} color={colors.text.secondary} />
        <Ionicons name="help-circle-outline" size={22} color={colors.text.secondary} />
        <Ionicons name="lock-closed-outline" size={22} color={colors.text.secondary} />
      </View>
      <Text style={styles.copyright}>© 2025 BUNDLY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 48,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 24,
    padding: 28,
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primary.main,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20,
  },
  googleBtnText: {
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.background.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.text.disabled,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text.primary,
    fontSize: 15,
    marginBottom: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: colors.text.primary,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    color: colors.text.disabled,
    marginBottom: 24,
    lineHeight: 16,
  },
  createBtn: {
    backgroundColor: colors.primary.dark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    color: colors.primary.contrast,
    fontWeight: '700',
    fontSize: 16,
  },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signinText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  signinLink: {
    color: colors.primary.main,
    fontWeight: '700',
    fontSize: 14,
  },
  terms: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.text.disabled,
    lineHeight: 17,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 16,
  },
  copyright: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 10,
    marginTop: 8,
    marginBottom: 32,
    letterSpacing: 1.5,
  },
});
