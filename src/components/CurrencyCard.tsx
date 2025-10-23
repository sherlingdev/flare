"use client";

import { ReactNode } from 'react';

interface CurrencyCardProps {
    children: ReactNode;
    className?: string;
}

export default function CurrencyCard({ children, className = '' }: CurrencyCardProps) {
    return (
        <div className={`currency-converter-card bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 sm:px-8 py-8 sm:py-12 w-full border border-slate-200/50 dark:border-slate-700/50 animate-scale-in ${className}`}>
            {children}
        </div>
    );
}







