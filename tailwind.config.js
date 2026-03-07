/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ai: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          bg: '#0F172A',
          card: '#1E293B',
          text: '#F1F5F9',
          accent: '#22D3EE',
        },
      },
      boxShadow: {
        glass: '0 20px 60px -24px rgba(15, 23, 42, 0.7)',
        glow: '0 0 0 1px rgba(99, 102, 241, 0.45), 0 15px 35px -18px rgba(99, 102, 241, 0.6)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(120deg, #6366F1 0%, #8B5CF6 55%, #22D3EE 100%)',
      },
    },
  },
  plugins: [],
};
