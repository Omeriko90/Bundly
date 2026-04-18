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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Error', error.message);
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your details to access your curated lists.
          </Text>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="hello@example.com"
              placeholderTextColor={colors.text.disabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.inputField}
            />
            <Ionicons name="mail-outline" size={18} color={colors.text.disabled} />
          </View>

          <View style={styles.passwordLabelRow}>
            <Text style={styles.label}>PASSWORD</Text>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.text.disabled}
              style={styles.inputField}
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
              <Ionicons
                name={showPassword ? 'eye' : 'lock-closed-outline'}
                size={18}
                color={colors.text.disabled}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(p => !p)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={styles.rememberText}>Remember me for 30 days</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Logging in...' : 'Log In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleBtn}>
            <Ionicons name="logo-google" size={18} color={colors.text.primary} />
            <Text style={styles.googleBtnText}>Google</Text>
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip — Browse App</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            <Text style={styles.termsLink}>Privacy</Text>
            {'  •  '}
            <Text style={styles.termsLink}>Terms</Text>
            {'  © 2025 BUNDLY'}
          </Text>
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
    marginBottom: 28,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputField: {
    flex: 1,
    paddingVertical: 14,
    color: colors.text.primary,
    fontSize: 15,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotText: {
    color: colors.primary.main,
    fontSize: 13,
    fontWeight: '600',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.ui.checkbox.unchecked,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.ui.checkbox.checked,
    borderColor: colors.ui.checkbox.checked,
  },
  rememberText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: colors.primary.dark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: colors.primary.contrast,
    fontWeight: '700',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.background.border,
  },
  googleBtnText: {
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 15,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signupText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  signupLink: {
    color: colors.primary.main,
    fontWeight: '700',
    fontSize: 14,
  },
  terms: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.text.disabled,
    letterSpacing: 0.5,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  skipText: {
    fontSize: 13,
    color: colors.text.disabled,
    textDecorationLine: 'underline',
  },
});
