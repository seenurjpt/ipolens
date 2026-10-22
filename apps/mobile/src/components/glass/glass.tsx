import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useResolvedScheme } from '@/lib/theme';

// Light catching the glass: a diagonal sheen from the top-left and a crisp highlight on the top edge.
const SHEEN = {
  light: ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0)'] as const,
  dark: ['rgba(255,255,255,0.20)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'] as const,
};
const EDGE = { light: 'rgba(255,255,255,1)', dark: 'rgba(255,255,255,0.45)' };

export interface GlassProps extends ViewProps {
  className?: string;
  /** Corner radius in px. */
  radius?: number;
  /** Denser glass for controls and inputs. */
  strong?: boolean;
}

/**
 * A translucent glass panel: frosted fill, bright rim, diagonal sheen and a lit top edge. It doesn't
 * blur — over the static gradient backdrop a blur would look the same but cost a lot on Android.
 * Real blur is used only where content scrolls underneath (the floating tab bar).
 */
export function Glass({ className = '', radius = 24, strong = false, style, children, ...props }: GlassProps) {
  const scheme = useResolvedScheme();
  return (
    <View
      className={`overflow-hidden border border-rim dark:border-rim-dark ${strong ? 'bg-strong dark:bg-strong-dark' : 'bg-surface dark:bg-surface-dark'} ${className}`}
      style={[{ borderRadius: radius }, style]}
      {...props}>
      <LinearGradient
        pointerEvents="none"
        colors={SHEEN[scheme]}
        locations={[0, 0.35, 0.7]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[styles.edge, { left: radius * 0.6, right: radius * 0.6, backgroundColor: EDGE[scheme] }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', top: 0, height: StyleSheet.hairlineWidth * 2, opacity: 0.9 },
});
