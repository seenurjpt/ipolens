import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { BRAND_GRADIENT, useResolvedScheme } from '@/lib/theme';

import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const LABEL: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-ink dark:text-ink-dark',
  danger: 'text-loss dark:text-loss-dark',
  ghost: 'text-brand dark:text-brand-dark',
};

/**
 * Pill button. Primary is a vivid gradient with a glass sheen; secondary and danger are glass.
 * forwardRef so it works inside <Link asChild>.
 */
export const Button = forwardRef<
  View,
  PressableProps & { label: string; variant?: Variant; busy?: boolean; className?: string }
>(function Button({ label, variant = 'primary', busy = false, disabled, className = '', ...props }, ref) {
  const scheme = useResolvedScheme();
  const off = disabled || busy;
  const glass = variant === 'secondary' || variant === 'danger';
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy }}
      disabled={off}
      className={`min-h-12 flex-row items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 active:opacity-80 ${
        glass ? 'border border-rim bg-strong dark:border-rim-dark dark:bg-strong-dark' : ''
      } ${off ? 'opacity-50' : ''} ${className}`}
      {...props}>
      {variant === 'primary' ? (
        <>
          <LinearGradient
            colors={BRAND_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
            style={[StyleSheet.absoluteFill, { height: '55%' }]}
          />
        </>
      ) : null}
      {busy ? (
        <ActivityIndicator size="small" color={variant === 'primary' || scheme === 'dark' ? '#FFFFFF' : '#5A6378'} />
      ) : null}
      <Text className={`font-sans-semibold text-sm ${LABEL[variant]}`}>{label}</Text>
    </Pressable>
  );
});
