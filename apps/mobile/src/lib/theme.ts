import { useColorScheme } from 'react-native';

import { useAppStore } from './store';

// Raw colour values for places className cannot reach (navigation, charts, icons, gradients).
// Keep in sync with tailwind.config.js.
const palette = {
  light: {
    base: '#ECEFF7',
    surface: 'rgba(255,255,255,0.55)',
    line: 'rgba(15,23,42,0.08)',
    rim: 'rgba(255,255,255,0.95)',
    ink: '#0B1020',
    muted: '#5A6378',
    brand: '#4F46E5',
    over: '#067647',
    under: '#B54708',
    loss: '#C4320A',
    onBrand: '#FFFFFF',
  },
  dark: {
    base: '#04050D',
    surface: 'rgba(255,255,255,0.10)',
    line: 'rgba(255,255,255,0.09)',
    rim: 'rgba(255,255,255,0.22)',
    ink: '#F4F6FF',
    muted: '#A7AFC6',
    brand: '#A5B4FC',
    over: '#5EE9A8',
    under: '#FDC35C',
    loss: '#FF8A80',
    onBrand: '#FFFFFF',
  },
} as const;

export type Palette = Record<keyof (typeof palette)['light'], string>;

/** The theme in effect: the user's choice in Settings, or the device theme. */
export function useResolvedScheme(): 'light' | 'dark' {
  const device = useColorScheme();
  const preference = useAppStore((s) => s.theme);
  if (preference !== 'system') return preference;
  return device === 'dark' ? 'dark' : 'light';
}

export function usePalette(): Palette {
  return palette[useResolvedScheme()];
}

/**
 * Aurora backdrop: wide glowing ribbons of blue, cyan and violet across the top, fading into a clean
 * base, with a faint glow at the bottom for depth. Each ribbon is an elliptical radial gradient;
 * cx/cy/rx/ry are fractions of the screen (rx of its width, ry of its height).
 */
export const BACKDROP = {
  light: {
    gradient: ['#E6ECFB', '#EEF0F8', '#ECEFF7'] as const,
    glows: [
      { color: '#3B82F6', opacity: 0.42, cx: '28%', cy: '-3%', rx: '80%', ry: '20%' },
      { color: '#22D3EE', opacity: 0.38, cx: '6%', cy: '12%', rx: '60%', ry: '12%' },
      { color: '#8B5CF6', opacity: 0.4, cx: '90%', cy: '7%', rx: '62%', ry: '16%' },
      { color: '#F0ABFC', opacity: 0.26, cx: '62%', cy: '24%', rx: '58%', ry: '9%' },
      { color: '#A5B4FC', opacity: 0.3, cx: '50%', cy: '106%', rx: '85%', ry: '22%' },
    ],
  },
  dark: {
    gradient: ['#0A0F26', '#05060F', '#04050D'] as const,
    glows: [
      { color: '#2563EB', opacity: 0.8, cx: '28%', cy: '-3%', rx: '80%', ry: '20%' },
      { color: '#06B6D4', opacity: 0.6, cx: '6%', cy: '12%', rx: '60%', ry: '12%' },
      { color: '#8B5CF6', opacity: 0.7, cx: '90%', cy: '7%', rx: '62%', ry: '16%' },
      { color: '#D946EF', opacity: 0.32, cx: '62%', cy: '24%', rx: '58%', ry: '9%' },
      { color: '#4338CA', opacity: 0.35, cx: '50%', cy: '106%', rx: '85%', ry: '22%' },
    ],
  },
} as const;

/** Vivid gradient for primary actions and hero cards. */
export const BRAND_GRADIENT = ['#6366F1', '#8B5CF6', '#A855F7'] as const;

// One colour per category line in the subscription chart.
export const CATEGORY_COLORS = {
  qib: '#6366F1',
  nii: '#C084FC',
  bnii: '#A78BFA',
  snii: '#DDD6FE',
  retail: '#FB923C',
  employee: '#2DD4BF',
  total: '#94A3B8',
} as const;
