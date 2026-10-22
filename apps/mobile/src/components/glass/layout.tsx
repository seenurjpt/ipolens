import { LinearGradient } from 'expo-linear-gradient';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Palette } from '@/lib/theme';

export const TAB_BAR_HEIGHT = 64;
const TAB_BAR_GAP = 10;

/**
 * Headers float over the content: transparent, with a fade from the backdrop colour so text
 * scrolling underneath stays legible (like iOS's scroll-edge effect).
 */
export function glassHeaderOptions(palette: Palette) {
  return {
    headerTransparent: true,
    headerShadowVisible: false,
    headerTintColor: palette.ink,
    headerTitleStyle: { fontFamily: 'Inter_600SemiBold', color: palette.ink },
    headerBackground: () => <HeaderFade color={palette.base} />,
  } as const;
}

function HeaderFade({ color }: { color: string }) {
  return (
    <LinearGradient
      colors={[color, `${color}E6`, `${color}00`]}
      locations={[0, 0.6, 1]}
      style={StyleSheet.absoluteFill}
    />
  );
}

/** Where the floating tab bar sits, from the bottom of the screen. */
export function useTabBarBottom() {
  return useSafeAreaInsets().bottom + TAB_BAR_GAP;
}

/**
 * Padding a scrolling screen needs so content starts below the floating header and can scroll
 * clear of the floating tab bar (or the bottom inset when there is no tab bar).
 */
export function useContentInsets({ tabBar = false }: { tabBar?: boolean } = {}) {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const tabBarBottom = useTabBarBottom();
  return {
    top: headerHeight + 8,
    bottom: tabBar ? tabBarBottom + TAB_BAR_HEIGHT + 20 : insets.bottom + 24,
  };
}
