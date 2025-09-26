"use client";

import AdSense from './AdSense';

interface AdBannerProps {
    className?: string;
    position?: 'top' | 'bottom';
}

export default function AdBanner({ className = '', position = 'top' }: AdBannerProps) {
    const adSlot = position === 'top' ? '6460980142' : '8428667939';

    return (
        <div className={`w-full h-32 md:h-28 ${className} bg-gradient-to-r from-slate-200/60 to-gray-200/60 dark:from-slate-600/50 dark:to-gray-600/50 rounded-lg border border-slate-300/50 dark:border-slate-500/40 shadow-sm`}>
            <AdSense
                adSlot={adSlot}
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
