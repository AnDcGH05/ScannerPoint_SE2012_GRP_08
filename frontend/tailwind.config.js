/** Colours, type scale and spacing copied from the Google Stitch design system (Prompt 0). */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ScannerPoint brand
        navy: { DEFAULT: '#1F3A63', dark: '#152845', light: '#2D4771' },
        orange: { DEFAULT: '#E67E22', dark: '#D35400', light: '#FDEBD9' },
        beige: { DEFAULT: '#F5EBDD', border: '#EAD9C3', text: '#8A5A20' },
        success: { DEFAULT: '#2E8B57', bg: '#E8F5E9', border: '#C8E6C9' },
        warning: { DEFAULT: '#D97706', amber: '#F2A93B', bg: '#FEF3C7', border: '#FDE68A' },
        danger: { DEFAULT: '#C0392B', bg: '#FDE8E8', border: '#F8B4B4' },
        page: '#F7F8FA',
        line: '#E2E8F0',
        // Stitch / Material tokens
        primary: '#03244c',
        'primary-container': '#1f3a63',
        'on-primary-container': '#8ba5d4',
        secondary: '#944a00',
        'secondary-container': '#fc8f34',
        surface: '#f8f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#edeef0',
        'surface-container-high': '#e7e8ea',
        'on-surface': '#191c1e',
        'on-surface-variant': '#44474e',
        outline: '#74777f',
        'outline-variant': '#c4c6d0',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'headline-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        'body-md': ['14px', { lineHeight: '20px' }],
        'body-sm': ['12px', { lineHeight: '16px' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '14px', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(31,58,99,0.05), 0 1px 2px rgba(31,58,99,0.03)',
        raised: '0 4px 6px -1px rgba(31,58,99,0.08), 0 2px 4px -2px rgba(31,58,99,0.04)',
        overlay: '0 10px 15px -3px rgba(31,58,99,0.12), 0 4px 6px -4px rgba(31,58,99,0.06)',
        glow: '0 0 0 4px rgba(230,126,34,0.18), 0 4px 14px rgba(230,126,34,0.35)',
      },
      borderRadius: {
        card: '12px',
        control: '8px',
      },
    },
  },
  plugins: [],
}
