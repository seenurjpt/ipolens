import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname, type Href } from 'expo-router';
import { useEffect, useState, type ComponentProps, type RefObject } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { usePalette, useResolvedScheme } from '@/lib/theme';

import { Text } from '../ui/text';
import { TAB_BAR_HEIGHT, useTabBarBottom } from './layout';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const TABS: { href: Href & string; label: string; icon: IconName; activeIcon: IconName }[] = [
  { href: '/home', label: 'Home', icon: 'home-variant-outline', activeIcon: 'home-variant' },
  { href: '/ipos', label: 'Explore', icon: 'compass-outline', activeIcon: 'compass' },
  { href: '/my-ipos', label: 'My IPOs', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { href: '/settings', label: 'Settings', icon: 'cog-outline', activeIcon: 'cog' },
];

/**
 * Floating frosted-glass tab bar. It truly blurs the screen scrolling underneath: on Android
 * `blurTarget` must point at the view that holds that content (see (tabs)/_layout.tsx).
 */
export function GlassTabBar({ blurTarget }: { blurTarget: RefObject<View | null> }) {
  const palette = usePalette();
  const scheme = useResolvedScheme();
  const bottom = useTabBarBottom();
  const pathname = usePathname();
  const keyboardOpen = useKeyboardOpen();

  if (keyboardOpen) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View
        accessibilityRole="tablist"
        className="overflow-hidden border border-rim dark:border-rim-dark"
        style={styles.bar}>
        <BlurView
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={70}
          tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
        {/* A light wash keeps labels legible where blur isn't available (older Android, web). */}
        <View className="bg-surface dark:bg-surface-dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          pointerEvents="none"
          colors={
            scheme === 'dark'
              ? ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']
          }
          style={[StyleSheet.absoluteFill, { height: '60%' }]}
        />
        <View className="flex-1 flex-row items-center px-1.5">
          {TABS.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Pressable
                key={tab.href}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: active }}
                onPress={() => router.navigate(tab.href)}
                className="flex-1 items-center justify-center">
                <View
                  className={`items-center gap-0.5 rounded-full px-4 py-1.5 ${active ? 'bg-brand-soft dark:bg-brand-soft-dark' : ''}`}>
                  <MaterialCommunityIcons
                    name={active ? tab.activeIcon : tab.icon}
                    size={22}
                    color={active ? palette.brand : palette.muted}
                  />
                  <Text
                    className={`text-[10px] ${active ? 'font-sans-semibold text-brand dark:text-brand-dark' : 'font-sans-medium text-muted dark:text-muted-dark'}`}>
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** Hide the floating bar while typing so it doesn't ride up on the keyboard. */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: { height: TAB_BAR_HEIGHT, borderRadius: TAB_BAR_HEIGHT / 2 },
});
