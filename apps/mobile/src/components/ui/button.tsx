import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const BOX: Record<Variant, string> = {
  primary: 'bg-brand dark:bg-brand-dark',
  secondary: 'border border-line bg-surface dark:border-line-dark dark:bg-surface-dark',
  danger: 'border border-loss/40 bg-surface dark:border-loss-dark/40 dark:bg-surface-dark',
  ghost: '',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-white dark:text-canvas-dark',
  secondary: 'text-ink dark:text-ink-dark',
  danger: 'text-loss dark:text-loss-dark',
  ghost: 'text-brand dark:text-brand-dark',
};

export function Button({
  label,
  variant = 'primary',
  busy = false,
  disabled,
  className = '',
  ...props
}: PressableProps & { label: string; variant?: Variant; busy?: boolean; className?: string }) {
  const off = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy }}
      disabled={off}
      className={`min-h-11 flex-row items-center justify-center gap-2 rounded-xl px-4 py-2.5 active:opacity-80 ${BOX[variant]} ${off ? 'opacity-50' : ''} ${className}`}
      {...props}>
      {busy ? <ActivityIndicator size="small" color="#98A2B3" /> : null}
      <Text className={`font-sans-semibold text-sm ${LABEL[variant]}`}>{label}</Text>
    </Pressable>
  );
}
