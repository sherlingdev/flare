"use client";

import { useEffect } from 'react';

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
        script.setAttribute('data-ad-client', 'ca-pub-7906398366781972'); // Your AdSense ID
        document.head.appendChild(script);
      }

      // Initialize ads
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-7906398366781972" // Your AdSense ID
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
