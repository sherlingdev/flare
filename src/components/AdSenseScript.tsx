"use client";

import { useEffect } from 'react';
import { adSenseConfig } from '../lib/adsense';

export default function AdSenseScript() {
    useEffect(() => {
        // Load AdSense script manually to avoid data-nscript attribute warning
        // AdSense requires the script in head without Next.js script attributes
        if (typeof window !== 'undefined') {
            // Check if script already exists
            if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
                const script = document.createElement('script');
                script.async = true;
                script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseConfig.publisherId}`;
                script.crossOrigin = 'anonymous';
                document.head.appendChild(script);
            }
        }
    }, []);

    return null;
}
