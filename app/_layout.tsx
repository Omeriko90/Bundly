import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { addEventListener, getInitialURL, parse } from 'expo-linking';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  useEffect(() => {
    // Handle deep link when app is opened from email confirmation link
    const handleDeepLink = async (url: string) => {
      const { queryParams } = parse(url);
      const access_token = queryParams?.access_token as string | undefined;
      const refresh_token = queryParams?.refresh_token as string | undefined;
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
    };

    getInitialURL().then(url => { if (url) handleDeepLink(url); });
    const linkingSub = addEventListener('url', ({ url }) => handleDeepLink(url));

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/(tabs)/home');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/(tabs)/home');
      } else if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
      linkingSub.remove();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="bundle/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="bundle/[id]" />
      <Stack.Screen name="bundle/[id]/invite" options={{ presentation: 'modal' }} />
      <Stack.Screen name="bundle/[id]/cheapest-store" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
