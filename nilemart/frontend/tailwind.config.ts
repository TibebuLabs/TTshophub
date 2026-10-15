import type { Config } from 'tailwindcss';
const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`;
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { 
        bg: v('bg'), 
        card: v('card'), 
        ink: v('ink'), 
        mute: v('mute'), 
        line: v('line'), 
        brand: { DEFAULT: '#ff6a00', 600: '#e55f00', 700: '#d45500', 50: '#fff7f2', 100: '#ffe5d9' }, 
        navy: { DEFAULT: '#0f1b33', 700: '#18284a', 800: '#0a1122', 50: '#f4f6f9' },
        success: { DEFAULT: '#10b981', 600: '#059669', 700: '#047857' },
        warning: { DEFAULT: '#f59e0b', 600: '#d97706' },
        error: { DEFAULT: '#ef4444', 600: '#dc2626' },
      },
      fontFamily: { sans: ['Inter', 'Noto Sans Ethiopic', 'system-ui', 'sans-serif'] },
      keyframes: { 
        up: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } }, 
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        slideDown: { from: { height: '0', opacity: '0' }, to: { height: 'var(--radix-accordion-content-height)', opacity: '1' } },
        slideUp: { from: { height: 'var(--radix-accordion-content-height)', opacity: '1' }, to: { height: '0', opacity: '0' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        bounce: { '0%, 100%': { transform: 'translateY(-5%)', animationTimingFunction: 'cubic-bezier(0.8,0,1,1)' }, '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0,0,0.2,1)' } },
      },
      animation: { 
        up: 'up .22s ease-out', 
        shimmer: 'shimmer 1.4s infinite',
        slideDown: 'slideDown 0.3s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleIn: 'scaleIn 0.2s ease-out',
        bounce: 'bounce 1s infinite',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'large': '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
