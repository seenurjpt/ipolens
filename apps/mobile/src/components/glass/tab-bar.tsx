import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname, type Href } from 'expo-router';
import { useEffect, useState, type ComponentProps, type RefObject } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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

const PADDING = 6; // inner padding around the tab row
const SPRING = { damping: 20, stiffness: 220, mass: 0.7 };

const tabIndex = (pathname: string) =>
  Math.max(
    0,
    TABS.findIndex((t) => pathname === t.href || pathname.startsWith(`${t.href}/`)),
  );

/**
 * Floating frosted-glass tab bar with a glass "lens" that springs to the selected tab. The lens
 * moves on the UI thread the moment a tab is pressed, before the next screen renders, so it stays
 * smooth even while that screen is busy. It truly blurs the content underneath: on Android
 * `blurTarget` must point at the view holding that content (see (tabs)/_layout.tsx).
 */
export function GlassTabBar({ blurTarget }: { blurTarget: RefObject<View | null> }) {
  const palette = usePalette();
  const scheme = useResolvedScheme();
  const bottom = useTabBarBottom();
  const pathname = usePathname();
  const keyboardOpen = useKeyboardOpen();

  const routeIndex = tabIndex(pathname);
  // A press shows its tab as selected straight away, until the route changes.
  const [pressed, setPressed] = useState<{ index: number; from: number } | null>(null);
  const selected = pressed && pressed.from === routeIndex ? pressed.index : routeIndex;
  const [itemWidth, setItemWidth] = useState(0);
  const x = useSharedValue(0);

  // Follow navigation that didn't come from the bar too (deep links, back button).
  useEffect(() => {
    x.set(withSpring(routeIndex * itemWidth, SPRING));
  }, [routeIndex, itemWidth, x]);

  const lensStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  const onLayout = (e: LayoutChangeEvent) => {
    const width = (e.nativeEvent.layout.width - PADDING * 2) / TABS.length;
    setItemWidth(width);
    x.set(selected * width); // place without animating on first layout
  };

  const select = (index: number) => {
    if (index === selected) return;
    setPressed({ index, from: routeIndex });
    x.set(withSpring(index * itemWidth, SPRING));
    if (Platform.OS !== 'web') void Haptics.selectionAsync();
    router.navigate(TABS[index]!.href);
  };

  if (keyboardOpen) return null;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View
        accessibilityRole="tablist"
        onLayout={onLayout}
        className="overflow-hidden border border-rim dark:border-rim-dark"
        style={styles.bar}>
        <BlurView
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={90}
          tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
        {/* A light wash keeps labels legible where blur isn't available (older Android, web). */}
        <View className="bg-surface dark:bg-surface-dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          pointerEvents="none"
          colors={
            scheme === 'dark'
              ? ['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']
          }
          style={[StyleSheet.absoluteFill, { height: '60%' }]}
        />

        {itemWidth > 0 ? (
          <Animated.View pointerEvents="none" style={[styles.lensTrack, { width: itemWidth }, lensStyle]}>
            <View className="flex-1 rounded-full border border-rim bg-brand-soft dark:border-rim-dark dark:bg-brand-soft-dark" />
          </Animated.View>
        ) : null}

        <View className="flex-1 flex-row items-center" style={{ paddingHorizontal: PADDING }}>
          {TABS.map((tab, index) => {
            const active = index === selected;
            return (
              <Pressable
                key={tab.href}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: active }}
                onPress={() => select(index)}
                className="h-full flex-1 items-center justify-center gap-0.5 active:opacity-70">
                <MaterialCommunityIcons
                  name={active ? tab.activeIcon : tab.icon}
                  size={22}
                  color={active ? palette.brand : palette.muted}
                />
                <Text
                  className={`text-[10px] ${active ? 'font-sans-semibold text-brand dark:text-brand-dark' : 'font-sans-medium text-muted dark:text-muted-dark'}`}>
                  {tab.label}
                </Text>
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
  lensTrack: { position: 'absolute', top: PADDING, bottom: PADDING, left: PADDING, padding: 0 },
});
