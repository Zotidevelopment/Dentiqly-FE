/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dental: {
          primary: 'var(--brand-primary, #2563FF)',
          secondary: 'var(--brand-secondary, #02E3FF)',
          'primary-light': '#5A8BFF',
          'primary-dark': '#1D4ED8',
          navy: '#0B1023',
          'navy-light': '#131B3A',
          surface: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ["'DM Sans'", 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 12px 40px -12px rgba(0, 0, 0, 0.12)',
        'sidebar': '4px 0 24px -2px rgba(0, 0, 0, 0.2)',
        'blue-glow': '0 8px 30px -4px rgba(37, 99, 255, 0.3)',
        'blue-glow-lg': '0 16px 48px -8px rgba(37, 99, 255, 0.4)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-in-up': 'fade-in-up 0.5s ease-out both',
        'slide-in-left': 'slide-in-left 0.3s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(37, 99, 255, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(37, 99, 255, 0.15)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 20% 80%, rgba(37, 99, 255, 0.05) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(2, 227, 255, 0.03) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-[#2563FF]',
    'bg-[#02E3FF]',
    'bg-[#5A8BFF]',
    'bg-[#1D4ED8]',
    'bg-[#0A0F2D]',
    'text-[#2563FF]',
    'text-[#02E3FF]',
    'text-[#0A0F2D]',
    'border-[#2563FF]',
    'border-[#02E3FF]',
    'ring-[#2563FF]',
    'hover:bg-[#1D4ED8]',
    'hover:border-[#2563FF]',
    'bg-[#F4F7FB]',
    'bg-[#F3F4F6]',
    'bg-[#E5E7EB]',
    'bg-[#D1D5DB]',
    'text-[#374151]',
    'text-[#4B5563]',
    'text-[#5C6B7B]',
    'text-[#9CA3AF]',
    'border-[#E5E7EB]',
    'border-[#D1D5DB]',
    'border-[#9CA3AF]',
    'text-[#EF4444]',
    'border-[#EF4444]',
    'text-[#10B981]',
    'bg-[#10B981]',
    'ring-[#3B82F6]',
    'bg-[#3B82F6]',
    'bg-[#2563FF]/10',
    'bg-[#2563FF]/5',
    'text-[#2563FF]',
    'border-[#2563FF]/50',
    'hover:bg-[#2563FF]/5',
    'hover:border-[#2563FF]/50',
    'line-clamp-2',
  ]
};
