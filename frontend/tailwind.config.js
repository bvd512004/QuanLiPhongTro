/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#F43F5E', // rose-500
                    light: '#FFE4E6', // rose-100
                    dark: '#E11D48', // rose-600
                },
                "background-light": "#ffffff",
                "background-dark": "#101922",
                "surface-light": "#f6f7f8",
                "surface-dark": "#1a2632",
            },
            fontFamily: {
                sans: ["Be Vietnam Pro", "sans-serif"],
                display: ["Be Vietnam Pro", "sans-serif"],
            },
            boxShadow: {
                soft: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
                hover: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            },
        },
    },
    plugins: [],
}
