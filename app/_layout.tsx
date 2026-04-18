import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="bundle/create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="bundle/[id]" />
      <Stack.Screen name="bundle/[id]/invite" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
