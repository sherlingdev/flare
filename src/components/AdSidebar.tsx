"use client";

import AdSense from './AdSense';

interface AdSidebarProps {
    className?: string;
    position?: 'left' | 'right';
}

export default function AdSidebar({ className = '', position = 'left' }: AdSidebarProps) {
    const adSlot = position === 'left' ? '6540871197' : '5227789522';

    return (
        <div className={`w-48 h-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center ${className}`}>
            <AdSense
                adSlot={adSlot}
                adFormat="vertical"
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
