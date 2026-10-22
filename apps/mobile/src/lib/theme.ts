import { useColorScheme } from 'react-native';

// Raw colour values for places className cannot reach (navigation, charts, icons).
// Keep in sync with tailwind.config.js.
const palette = {
  light: {
    canvas: '#F4F5F7',
    surface: '#FFFFFF',
    line: '#E4E7EC',
    ink: '#101828',
    muted: '#667085',
    brand: '#3355E0',
    over: '#067647',
    under: '#B54708',
    loss: '#B42318',
  },
  dark: {
    canvas: '#0B0D10',
    surface: '#15181D',
    line: '#262A31',
    ink: '#ECEEF1',
    muted: '#98A2B3',
    brand: '#7B93FF',
    over: '#47CD89',
    under: '#FDB022',
    loss: '#F97066',
  },
} as const;

export type Palette = Record<keyof (typeof palette)['light'], string>;

export function usePalette(): Palette {
  return palette[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

// One colour per category line in the subscription chart.
export const CATEGORY_COLORS = {
  qib: '#3355E0',
  nii: '#9E77ED',
  bnii: '#7A5AF8',
  snii: '#C3B5FD',
  retail: '#F79009',
  employee: '#15B79E',
  total: '#667085',
} as const;
