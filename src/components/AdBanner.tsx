"use client";

import AdSense from './AdSense';

interface AdBannerProps {
    className?: string;
}

export default function AdBanner({ className = '' }: AdBannerProps) {
    return (
        <div className={`w-full h-32 md:h-28 bg-slate-200/50 dark:bg-slate-700/30 rounded-lg flex items-center justify-center border border-slate-300/40 dark:border-slate-600/20 ${className}`}>
            <AdSense
                adSlot="6460980142" // Top banner ad slot
                adFormat="horizontal"
                className="w-full h-full"
                adStyle={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent'
                }}
            />
            {/* Placeholder text while ads load */}
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm">
                Advertisement
            </div>
        </div>
    );
}
