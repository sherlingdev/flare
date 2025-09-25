"use client";

import AdSense from './AdSense';

interface AdBannerProps {
    className?: string;
}

export default function AdBanner({ className = '' }: AdBannerProps) {
    return (
        <div className={`w-full h-32 md:h-28 bg-slate-200/50 dark:bg-slate-700/30 rounded-lg flex items-center justify-center border border-slate-300/40 dark:border-slate-600/20 ${className}`}>
            <AdSense
                adSlot="1234567890" // Replace with your banner ad slot
                adFormat="horizontal"
                className="w-full h-full"
                adStyle={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'transparent'
                }}
            />
        </div>
    );
}
