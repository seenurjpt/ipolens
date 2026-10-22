import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { usePalette } from '@/lib/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const palette = usePalette();
  return <MaterialCommunityIcons name={name} size={24} color={focused ? palette.brand : palette.muted} />;
}

export default function TabLayout() {
  const palette = usePalette();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.brand,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
        tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.line },
        headerStyle: { backgroundColor: palette.canvas },
        headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'IPOLens',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home-variant-outline" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ipos"
        options={{ title: 'Explore', tabBarIcon: ({ focused }) => <TabIcon name="compass-outline" focused={focused} /> }}
      />
      <Tabs.Screen
        name="my-ipos"
        options={{ title: 'My IPOs', tabBarIcon: ({ focused }) => <TabIcon name="briefcase-outline" focused={focused} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ focused }) => <TabIcon name="cog-outline" focused={focused} /> }}
      />
    </Tabs>
  );
}
