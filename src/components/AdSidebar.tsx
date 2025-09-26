"use client";

import AdSense from './AdSense';

interface AdSidebarProps {
    className?: string;
}

export default function AdSidebar({ className = '' }: AdSidebarProps) {
    return (
        <div className={`w-48 h-80 ${className}`}>
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
