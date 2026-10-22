/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // NativeWind still follows the system theme; 'media' throws on web
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Pair every light token with its `-dark` twin and use both: `bg-surface dark:bg-surface-dark`.
      colors: {
        canvas: { DEFAULT: '#F4F5F7', dark: '#0B0D10' },
        surface: { DEFAULT: '#FFFFFF', dark: '#15181D' },
        line: { DEFAULT: '#E4E7EC', dark: '#262A31' },
        ink: { DEFAULT: '#101828', dark: '#ECEEF1' },
        muted: { DEFAULT: '#667085', dark: '#98A2B3' },
        brand: { DEFAULT: '#3355E0', dark: '#7B93FF', soft: '#EBEFFD', 'soft-dark': '#1C2445' },
        // Subscription colour only says over or under 1x (SPEC: Mobile app screens > UX rules).
        over: { DEFAULT: '#067647', dark: '#47CD89', soft: '#E7F6EE', 'soft-dark': '#11291D' },
        under: { DEFAULT: '#B54708', dark: '#FDB022', soft: '#FEF4E6', 'soft-dark': '#2E2110' },
        loss: { DEFAULT: '#B42318', dark: '#F97066' },
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
