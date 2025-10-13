"use client";

import { useEffect } from 'react';
import { adSenseConfig } from '../lib/adsense';

export default function AdSenseScript() {
    useEffect(() => {
        // Load AdSense script only on client side
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseConfig.publisherId}`;
        script.crossOrigin = 'anonymous';

        // Only add if not already present
        if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
            document.head.appendChild(script);
        }
    }, []);

    return null;
}
