"use client";

import AdSense from './AdSense';

interface AdSidebarProps {
    className?: string;
}

export default function AdSidebar({ className = '' }: AdSidebarProps) {
    return (
        <div className={`w-48 h-80 bg-slate-100/30 dark:bg-slate-700/30 rounded-lg flex items-center justify-center border border-slate-200/20 dark:border-slate-600/20 ${className}`}>
            <AdSense
                adSlot="0987654321" // Replace with your sidebar ad slot
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
