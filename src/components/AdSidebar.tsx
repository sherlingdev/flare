"use client";

import AdSense from './AdSense';

interface AdSidebarProps {
    className?: string;
    position?: 'left' | 'right';
}

export default function AdSidebar({ className = '', position = 'left' }: AdSidebarProps) {
    const adSlot = position === 'left' ? '6540871197' : '5227789522';
    
    return (
        <div className={`w-48 h-80 ${className} bg-gradient-to-b from-slate-200/60 to-gray-200/60 dark:from-slate-800/60 dark:to-gray-800/60 rounded-lg border border-slate-300/50 dark:border-slate-600/30 shadow-sm`}>
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
