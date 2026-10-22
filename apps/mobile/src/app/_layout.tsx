import '../../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colorScheme } from 'nativewind';
import { useEffect, useLayoutEffect } from 'react';
import { Platform, View } from 'react-native';

import { Backdrop } from '@/components/glass/backdrop';
import { glassHeaderOptions } from '@/components/glass/layout';
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

  // darkMode is 'class' (tailwind.config.js). On native, colorScheme.set() sets the app's
  // Appearance, which both NativeWind's dark: classes and useColorScheme (palette, backdrop,
  // tab bar) read, so the two always agree. Pass the preference, not the resolved scheme:
  // 'system' must stay 'system' so the app keeps following the device.
  // On web the dark: styles are plain CSS keyed on a .dark class on <html>.
  useLayoutEffect(() => {
    if (Platform.OS === 'web') document.documentElement.classList.toggle('dark', scheme === 'dark');
    else colorScheme.set(preference);
  }, [preference, scheme]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  // Screens are transparent so the shared glass backdrop shows through every one of them.
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.brand,
      background: 'transparent',
      card: 'transparent',
      border: palette.line,
      text: palette.ink,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <View style={{ flex: 1, backgroundColor: palette.base }}>
          <Backdrop />
          <Stack
            screenOptions={{
              ...glassHeaderOptions(palette),
              contentStyle: { backgroundColor: 'transparent' },
              // Crossfade: screens are see-through, so sliding one over another would show both.
              animation: 'fade',
            }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="ipo/[slug]/index" options={{ title: '' }} />
            <Stack.Screen name="ipo/[slug]/report" options={{ title: 'Analysis report' }} />
            <Stack.Screen name="ipo/[slug]/apply" options={{ title: 'Mark as applied' }} />
            <Stack.Screen name="allotment/[slug]" options={{ title: 'Check allotment' }} />
            <Stack.Screen name="pans/add" options={{ title: 'Add a PAN' }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          </Stack>
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
