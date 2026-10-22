import { BlurTargetView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { useRef } from 'react';
import { View } from 'react-native';

import { Backdrop } from '@/components/glass/backdrop';
import { glassHeaderOptions } from '@/components/glass/layout';
import { GlassTabBar } from '@/components/glass/tab-bar';
import { usePalette } from '@/lib/theme';

export default function TabLayout() {
  const palette = usePalette();
  // The floating tab bar blurs whatever is inside this view (required for blur on Android).
  const blurTarget = useRef<View>(null);

  return (
    <View style={{ flex: 1 }}>
      <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
        <Backdrop />
        <Tabs
          tabBar={() => null}
          screenOptions={{
            ...glassHeaderOptions(palette),
            headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: palette.ink },
            headerTitleAlign: 'left',
            sceneStyle: { backgroundColor: 'transparent' },
            // Smooth tab switches: a short crossfade, all tabs mounted up front so a switch never
            // waits for a first render, and hidden tabs frozen so they don't re-render in the background.
            animation: 'fade',
            transitionSpec: { animation: 'timing', config: { duration: 200 } },
            lazy: false,
            freezeOnBlur: true,
          }}>
          <Tabs.Screen name="home" options={{ title: 'IPOLens' }} />
          <Tabs.Screen name="ipos" options={{ title: 'Explore' }} />
          <Tabs.Screen name="my-ipos" options={{ title: 'My IPOs' }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
      </BlurTargetView>
      <GlassTabBar blurTarget={blurTarget} />
    </View>
  );
}
