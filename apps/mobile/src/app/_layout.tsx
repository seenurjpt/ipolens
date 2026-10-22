import '../../global.css';

import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { queryClient } from '@/lib/query-client';
import { useAppStore, useStoreHydrated } from '@/lib/store';
import { usePalette, useResolvedScheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const hydrated = useStoreHydrated();
  const preference = useAppStore((s) => s.theme);
  const scheme = useResolvedScheme();
  const palette = usePalette();
  const ready = (fontsLoaded || !!fontError) && hydrated;

  // darkMode is 'class' (tailwind.config.js). On native NativeWind applies the preference itself;
  // on web its dark: styles are plain CSS keyed on a .dark class on <html>.
  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.classList.toggle('dark', scheme === 'dark');
    else colorScheme.set(preference);
  }, [preference, scheme]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: palette.brand, background: palette.canvas, card: palette.surface, border: palette.line, text: palette.ink },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerTitleStyle: { fontFamily: 'Inter_600SemiBold' }, headerShadowVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="ipo/[slug]/index" options={{ title: '' }} />
          <Stack.Screen name="ipo/[slug]/report" options={{ title: 'Analysis report' }} />
          <Stack.Screen name="ipo/[slug]/apply" options={{ title: 'Mark as applied', presentation: 'modal' }} />
          <Stack.Screen name="allotment/[slug]" options={{ title: 'Check allotment' }} />
          <Stack.Screen name="pans/add" options={{ title: 'Add a PAN', presentation: 'modal' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
