import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: {
          light: '#d8dce1',
          dark: '#969da4',
        },
        semantic: {
          blue: '#298fff',
          green: '#4bd579',
          red: '#ff6158',
          yellow: '#ffd429',
          purple: '#bc6ee3',
          orange: '#ff8e38',
          pink: '#ff4fa4',
          teal: '#29d0c5',
          cyan: '#70c8f2',
          indigo: '#6f6dd2',
        },
        semanticDark: {
          blue: '#1e67b8',
          green: '#2b7a46',
          red: '#b8463f',
          yellow: '#8f7717',
          purple: '#874fa3',
          orange: '#cc722d',
          pink: '#b83976',
          teal: '#1c8f87',
          cyan: '#4c87a3',
          indigo: '#615fb8',
        },
        semanticLight: {
          blue: '#d4e9ff',
          green: '#dbf7e4',
          red: '#ffe6e4',
          yellow: '#fff5cc',
          purple: '#f2e2f9',
          orange: '#ffe8d7',
          pink: '#ffdced',
          teal: '#ccf4f1',
          cyan: '#ddf2fc',
          indigo: '#e2e2f6',
        },
        background: {
          white: '#ffffff',
          light: '#f6f7f8',
          muted: '#e8ebed',
        },
        text: {
          l1: '#1e232e',
          l2: '#2a2f3a',
          l3: '#3a4050',
          l4: '#4b5162',
          l5: '#5e6475',
          l6: '#757b8c',
          l7: '#9399a8',
          l8: '#bbc2cb',
          white: '#ffffff',
        },
        whatsapp: {
          light: '#25D366',
          DEFAULT: '#128C7E',
          dark: '#075E54',
          bg: '#ECE5DD',
          bubbleOut: '#DCF8C6',
          bubbleIn: '#FFFFFF',
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const inter = 'Inter, sans-serif';
      const jetbrains = "'JetBrains Mono', monospace";
      const customTextStyles = {
        // Headline
        '.headline-extra-large': {
          fontSize: '28px',
          lineHeight: '100%',
          fontWeight: '600',
          fontFamily: inter,
          letterSpacing: '-0.02em',
        },
        '.headline-large': {
          fontSize: '24px',
          lineHeight: '100%',
          fontWeight: '600',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        '.headline-medium': {
          fontSize: '18px',
          lineHeight: '100%',
          fontWeight: '600',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        '.headline-small': {
          fontSize: '15px',
          lineHeight: '100%',
          fontWeight: '600',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        // Body Text
        '.body-text-bold': {
          fontSize: '13px',
          lineHeight: '100%',
          fontWeight: '600',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        '.body-text-primary': {
          fontSize: '13px',
          lineHeight: '100%',
          fontWeight: '500',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        '.body-text-secondary': {
          fontSize: '13px',
          lineHeight: '100%',
          fontWeight: '400',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        // Caption
        '.caption-primary': {
          fontSize: '12px',
          lineHeight: '100%',
          fontWeight: '500',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        '.caption-secondary': {
          fontSize: '10px',
          lineHeight: '100%',
          fontWeight: '400',
          fontFamily: inter,
          letterSpacing: '-0.01em',
        },
        // Mono utilities
        '.font-jetbrains': {
          fontFamily: jetbrains,
        },
      };

      addUtilities(customTextStyles);
    }),
  ],
};
