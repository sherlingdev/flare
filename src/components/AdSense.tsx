"use client";

import { useEffect } from 'react';
import { adSenseConfig } from '../lib/adsense';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  responsive = true
}: AdSenseProps) {
  useEffect(() => {
    try {
      // Load AdSense script if not already loaded
      if (typeof window !== 'undefined' && !window.adsbygoogle) {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.setAttribute('data-ad-client', adSenseConfig.publisherId);
        script.onerror = () => {
          // AdSense script failed to load - silent handling
        };
        document.head.appendChild(script);
      }

      // Initialize ads with error handling
      if (window.adsbygoogle) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // AdSense initialization failed - silent handling
        }
      }
    } catch {
      // AdSense setup failed - silent handling
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={adSenseConfig.publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

// Declare global types for AdSense
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}
