import type { Config } from "tailwindcss";

const config: Config = {
  // PENTING: Aktifkan dark mode dengan class
  darkMode: 'class', 
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PENTING: Definisikan ulang warna agar menunjuk ke variabel CSS
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        colorHoverDiagram: 'var(--color-orange)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        // Hapus palet warna 50-950 yang tidak terpakai jika Anda hanya menggunakan variabel CSS
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
