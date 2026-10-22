/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // NativeWind still follows the system theme; 'media' throws on web
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Pair every light token with its `-dark` twin and use both: `bg-surface dark:bg-surface-dark`.
      // Glass design: screens sit on a gradient backdrop (components/backdrop.tsx), so surfaces
      // are translucent. rgba tokens don't take opacity modifiers (`/50`); add a token instead.
      // Keep in sync with src/lib/theme.ts.
      colors: {
        // Solid backdrop base, for navigation containers and transitions.
        base: { DEFAULT: '#ECEFF7', dark: '#04050D' },
        // Glass panels (cards) and stronger glass (inputs, controls, selected pills).
        surface: { DEFAULT: 'rgba(255,255,255,0.55)', dark: 'rgba(255,255,255,0.10)' },
        strong: { DEFAULT: 'rgba(255,255,255,0.8)', dark: 'rgba(255,255,255,0.18)' },
        // Subtle inset fill inside glass (chips, table header, stat tiles).
        canvas: { DEFAULT: 'rgba(255,255,255,0.36)', dark: 'rgba(255,255,255,0.07)' },
        // Bright glass rim and hairline dividers.
        rim: { DEFAULT: 'rgba(255,255,255,0.95)', dark: 'rgba(255,255,255,0.22)' },
        line: { DEFAULT: 'rgba(15,23,42,0.08)', dark: 'rgba(255,255,255,0.09)' },
        ink: { DEFAULT: '#0B1020', dark: '#F4F6FF' },
        muted: { DEFAULT: '#5A6378', dark: '#A7AFC6' },
        brand: {
          DEFAULT: '#4F46E5',
          dark: '#A5B4FC',
          soft: 'rgba(79,70,229,0.12)',
          'soft-dark': 'rgba(165,180,252,0.16)',
        },
        // Subscription colour only says over or under 1x (SPEC: Mobile app screens > UX rules).
        over: { DEFAULT: '#067647', dark: '#5EE9A8', soft: 'rgba(6,118,71,0.12)', 'soft-dark': 'rgba(94,233,168,0.14)' },
        under: { DEFAULT: '#B54708', dark: '#FDC35C', soft: 'rgba(181,71,8,0.12)', 'soft-dark': 'rgba(253,195,92,0.15)' },
        loss: { DEFAULT: '#C4320A', dark: '#FF8A80' },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
