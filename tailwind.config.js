/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // Typography System
            fontSize: {
                // Mobile-first responsive typography
                'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],      // 12px
                'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],   // 14px
                'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],            // 16px
                'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],  // 18px
                'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],   // 20px
                '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],      // 24px
                '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }], // 30px
                '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],   // 36px
                '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.025em' }],           // 48px

                // Custom sizes for specific use cases
                'display': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],   // 40px
                'heading': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }], // 28px
                'subheading': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }], // 18px
                'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],               // 16px
                'caption': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }], // 14px
                'small': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],    // 12px
            },

            // Font Weights
            fontWeight: {
                'light': '300',
                'normal': '400',
                'medium': '500',
                'semibold': '600',
                'bold': '700',
                'extrabold': '800',
            },

            // Letter Spacing
            letterSpacing: {
                'tighter': '-0.05em',
                'tight': '-0.025em',
                'normal': '0',
                'wide': '0.025em',
                'wider': '0.05em',
                'widest': '0.1em',
            },

            // Line Heights
            lineHeight: {
                'none': '1',
                'tight': '1.25',
                'snug': '1.375',
                'normal': '1.5',
                'relaxed': '1.625',
                'loose': '2',
            },

        },
    },
    plugins: [],
    // Force include all classes
    safelist: [
        'bg-slate-50',
        'bg-slate-100',
        'bg-slate-200',
        'bg-slate-300',
        'bg-slate-600',
        'bg-slate-700',
        'bg-slate-800',
        'bg-slate-900',
        'text-slate-100',
        'text-slate-200',
        'text-slate-300',
        'text-slate-600',
        'text-slate-700',
        'text-slate-800',
        'border-slate-200',
        'border-slate-600',
        'border-slate-700',
        'hover:bg-slate-200',
        'hover:bg-slate-600',
        'hover:border-slate-300',
        'hover:border-slate-500',
        'rounded-full',
        'rounded-2xl',
        'backdrop-blur-sm',
        'backdrop-blur-md',
        'shadow-2xl',
        'from-slate-50',
        'to-gray-100',
        'from-slate-900',
        'to-gray-800',
    ],
}