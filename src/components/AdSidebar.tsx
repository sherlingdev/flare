"use client";

import AdSense from './AdSense';

interface AdSidebarProps {
    className?: string;
    position?: 'left' | 'right';
}

export default function AdSidebar({ className = '', position = 'left' }: AdSidebarProps) {
    const adSlot = position === 'left' ? '6540871197' : '5544332211';
    
    return (
        <div className={`w-48 h-80 ${className} bg-slate-200/50 dark:bg-slate-700/30 rounded-lg border border-slate-300/40 dark:border-slate-600/20`}>
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
