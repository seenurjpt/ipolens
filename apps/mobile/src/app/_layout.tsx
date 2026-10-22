import '../../global.css';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { queryClient } from '@/lib/query-client';
import { usePalette } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();
// darkMode is 'class' (see tailwind.config.js), so tell NativeWind to follow the device theme.
// Skipped during static web rendering, where there is no device theme.
if (Platform.OS !== 'web' || typeof window !== 'undefined') colorScheme.set('system');

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const scheme = useColorScheme();
  const palette = usePalette();

  // On web NativeWind's dark: styles are plain CSS keyed on a .dark class on <html>.
  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.classList.toggle('dark', scheme === 'dark');
  }, [scheme]);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: palette.brand, background: palette.canvas, card: palette.surface, border: palette.line, text: palette.ink },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerTitleStyle: { fontFamily: 'Inter_600SemiBold' }, headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ipo/[slug]/index" options={{ title: '' }} />
          <Stack.Screen name="ipo/[slug]/report" options={{ title: 'Analysis report' }} />
          <Stack.Screen name="allotment/[slug]" options={{ title: 'Check allotment' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
