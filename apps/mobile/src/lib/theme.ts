import { useColorScheme } from 'react-native';

import { useAppStore } from './store';

// Raw colour values for places className cannot reach (navigation, charts, icons, gradients).
// Keep in sync with tailwind.config.js.
const palette = {
  light: {
    base: '#EEF1FF',
    surface: 'rgba(255,255,255,0.58)',
    line: 'rgba(15,23,42,0.08)',
    rim: 'rgba(255,255,255,0.9)',
    ink: '#0B1020',
    muted: '#5A6378',
    brand: '#4F46E5',
    over: '#067647',
    under: '#B54708',
    loss: '#C4320A',
    onBrand: '#FFFFFF',
  },
  dark: {
    base: '#080B1E',
    surface: 'rgba(255,255,255,0.075)',
    line: 'rgba(255,255,255,0.09)',
    rim: 'rgba(255,255,255,0.16)',
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

/** Backdrop gradient and the coloured glows that show through the glass. */
export const BACKDROP = {
  light: {
    gradient: ['#E8ECFF', '#F3EEFF', '#E7F6FB'] as const,
    glows: [
      { color: '#818CF8', opacity: 0.45, cx: '8%', cy: '6%', r: '55%' },
      { color: '#F0ABFC', opacity: 0.35, cx: '100%', cy: '42%', r: '50%' },
      { color: '#67E8F9', opacity: 0.35, cx: '0%', cy: '92%', r: '55%' },
    ],
  },
  dark: {
    gradient: ['#080B1E', '#120B2E', '#05141F'] as const,
    glows: [
      { color: '#6366F1', opacity: 0.5, cx: '8%', cy: '6%', r: '55%' },
      { color: '#C026D3', opacity: 0.32, cx: '100%', cy: '42%', r: '50%' },
      { color: '#06B6D4', opacity: 0.3, cx: '0%', cy: '92%', r: '55%' },
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
