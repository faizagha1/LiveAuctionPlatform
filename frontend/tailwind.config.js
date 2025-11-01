/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['Space Mono', 'Courier New', 'monospace'],
                sans: ['Space Mono', 'Courier New', 'monospace'], // Make mono the default
            },
            colors: {
                glass: {
                    light: 'rgba(255, 255, 255, 0.1)',
                    medium: 'rgba(255, 255, 255, 0.05)',
                    dark: 'rgba(0, 0, 0, 0.2)',
                },
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'slideIn': 'slideIn 0.3s ease-out',
                'gridPulse': 'gridPulse 8s ease-in-out infinite',
                'ornamentFloat': 'ornamentFloat 12s ease-in-out infinite',
                'geometricShift': 'geometricShift 6s ease-in-out infinite',
                'cornerPulse': 'cornerPulse 4s ease-in-out infinite',
                'lineShimmer': 'lineShimmer 5s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideIn: {
                    'from': {
                        transform: 'translateX(100%)',
                        opacity: '0',
                    },
                    'to': {
                        transform: 'translateX(0)',
                        opacity: '1',
                    },
                },
                gridPulse: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '0.7' },
                },
                ornamentFloat: {
                    '0%, 100%': {
                        transform: 'translate(0, 0) rotate(0deg)',
                        opacity: '0.2',
                    },
                    '25%': {
                        transform: 'translate(10px, -10px) rotate(1deg)',
                        opacity: '0.3',
                    },
                    '50%': {
                        transform: 'translate(0, -20px) rotate(0deg)',
                        opacity: '0.25',
                    },
                    '75%': {
                        transform: 'translate(-10px, -10px) rotate(-1deg)',
                        opacity: '0.3',
                    },
                },
                geometricShift: {
                    '0%, 100%': {
                        transform: 'translateX(0) scaleX(1)',
                        opacity: '0.2',
                    },
                    '50%': {
                        transform: 'translateX(-20px) scaleX(1.1)',
                        opacity: '0.4',
                    },
                },
                cornerPulse: {
                    '0%, 100%': {
                        opacity: '0.3',
                        borderColor: 'rgba(168, 85, 247, 0.3)',
                    },
                    '50%': {
                        opacity: '0.6',
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                    },
                },
                lineShimmer: {
                    '0%': {
                        opacity: '0.2',
                        transform: 'scaleX(0.8)',
                    },
                    '50%': {
                        opacity: '0.5',
                        transform: 'scaleX(1)',
                    },
                    '100%': {
                        opacity: '0.2',
                        transform: 'scaleX(0.8)',
                    },
                },
            },
        },
    },
    plugins: [],
}