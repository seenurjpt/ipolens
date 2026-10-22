import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { BRAND_GRADIENT } from '@/lib/theme';

/** A vivid brand-gradient glass card for highlights (P&L summary, "Allotment is out"). Text on it is white. */
export function HeroCard({ className = '', style, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={`overflow-hidden border border-white/30 ${className}`}
      style={[{ borderRadius: 24 }, style]}
      {...props}>
      <LinearGradient
        colors={BRAND_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.32)', 'rgba(255,255,255,0)']}
        style={[StyleSheet.absoluteFill, { height: '55%' }]}
      />
      {children}
    </View>
  );
}
