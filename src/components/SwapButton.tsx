"use client";

import { lazy, Suspense } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Lazy load the icon for better performance
const ArrowUpDown = lazy(() => import("lucide-react").then(module => ({ default: module.ArrowUpDown })));

interface SwapButtonProps {
    onClick: () => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal';
    disabled?: boolean;
}

export default function SwapButton({
    onClick,
    className = '',
    size = 'md',
    variant = 'default',
    disabled = false
}: SwapButtonProps) {
    const { mounted } = useLanguage();

    // Size configurations
    const sizeClasses = {
        sm: 'p-2',
        md: 'p-3 sm:p-4',
        lg: 'p-4 sm:p-5'
    };

    const iconSizes = {
        sm: 'w-3 h-3 sm:w-4 sm:h-4',
        md: 'w-4 h-4 sm:w-5 sm:h-5',
        lg: 'w-5 h-5 sm:w-6 sm:h-6'
    };

    // Variant configurations
    const variantClasses = {
        default: 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 shadow-lg hover:shadow-xl',
        minimal: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 shadow-none hover:shadow-md'
    };

    const baseClasses = `
    rounded-full 
    transition-all 
    duration-300 
    ease-in-out
    flex 
    items-center 
    justify-center
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={baseClasses}
            aria-label={mounted ? "Swap currencies" : "Swap currencies"}
            title={mounted ? "Swap currencies" : "Swap currencies"}
        >
            <Suspense fallback={
                <div className={`${iconSizes[size]} bg-gray-300 dark:bg-gray-500 rounded animate-pulse`} />
            }>
                <ArrowUpDown className={`${iconSizes[size]} text-flare-primary rotate-90`} />
            </Suspense>
        </button>
    );
}










