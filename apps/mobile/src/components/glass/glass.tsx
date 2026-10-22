import { LinearGradient } from 'expo-linear-gradient';
import { View, type ViewProps } from 'react-native';

import { useResolvedScheme } from '@/lib/theme';

const SHEEN = {
  light: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)'] as const,
  dark: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)'] as const,
};

export interface GlassProps extends ViewProps {
  className?: string;
  /** Corner radius in px. */
  radius?: number;
  /** Denser glass for controls and inputs. */
  strong?: boolean;
}

/**
 * A translucent glass panel: frosted fill, bright rim and a soft top sheen. It doesn't blur —
 * over the static gradient backdrop a blur would look identical but cost a lot on Android.
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
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '55%' }}
      />
      {children}
    </View>
  );
}
