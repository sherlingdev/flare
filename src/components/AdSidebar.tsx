"use client";

import AdSense from './AdSense';

interface AdSidebarProps {
    className?: string;
    position?: 'left' | 'right';
}

export default function AdSidebar({ className = '', position = 'left' }: AdSidebarProps) {
    const adSlot = position === 'left' ? '6540871197' : '5227789522';
    
    return (
        <div className={`w-48 h-80 ${className} bg-slate-100/30 dark:bg-slate-800/30 rounded-lg border border-slate-200/20 dark:border-slate-700/20`}>
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
