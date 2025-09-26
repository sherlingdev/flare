"use client";

import AdSense from './AdSense';

interface AdSidebarProps {
    className?: string;
    position?: 'left' | 'right';
}

export default function AdSidebar({ className = '', position = 'left' }: AdSidebarProps) {
    const adSlot = position === 'left' ? '6540871197' : '5227789522';
    
    return (
        <div className={`w-48 h-80 ${className}`} style={{ display: 'none' }}>
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
