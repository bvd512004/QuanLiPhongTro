/** @type {import('tailwindcss').Config} */
export default {
  // Chỉ áp dụng dark: khi có class `dark` trên ancestor (không theo OS).
  // Giữ <html> không có `dark` => toàn app luôn light.
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // blue-500
      },
    },
  },
  plugins: [],
}

